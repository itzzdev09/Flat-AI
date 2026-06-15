from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os

from ml.property_data import get_property_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def as_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_string(value):
    return str(value or '').strip().lower()


def similarity_score(source, target):
    score = 0.0

    if normalize_string(source.get('location')) == normalize_string(target.get('location')):
        score += 0.35
    if as_float(source.get('BEDROOM_NUM')) == as_float(target.get('BEDROOM_NUM')):
        score += 0.2
    if source.get('AGE') == target.get('AGE'):
        score += 0.1
    if source.get('FURNISH') == target.get('FURNISH'):
        score += 0.1
    if source.get('amenity_luxury') == target.get('amenity_luxury'):
        score += 0.1
    if source.get('FLOOR_NUM') == target.get('FLOOR_NUM'):
        score += 0.05
    if as_float(source.get('BALCONY_NUM')) == as_float(target.get('BALCONY_NUM')):
        score += 0.03

    area_gap = abs(as_float(source.get('AREA')) - as_float(target.get('AREA')))
    price_gap = abs(as_float(source.get('PRICE')) - as_float(target.get('PRICE')))
    score += max(0.0, 0.1 - area_gap / 7000)
    score += max(0.0, 0.07 - price_gap / 8)

    return min(score, 1.0)


def ranked_recommendations(source, properties, top_n=10):
    scored = []
    for item in properties:
        if item.get('PROP_ID') == source.get('PROP_ID'):
            continue
        scored.append((item, similarity_score(source, item)))

    scored.sort(key=lambda pair: pair[1], reverse=True)
    return [
        {
            'PropertyID': item.get('PROP_ID'),
            'Similarity': f'{score * 100:.2f}'
        }
        for item, score in scored[:top_n]
    ]


@csrf_exempt
def getRecommendations(req, PROP_ID):
    if req.method == 'POST':
        properties = get_property_data()
        source = next((item for item in properties if item.get('PROP_ID') == PROP_ID), None)

        if source is None:
            return JsonResponse({'error': 'Property not found'}, status=404)

        return JsonResponse(ranked_recommendations(source, properties), safe=False)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def prediction_recommendation(req, top_n=10):
    if req.method == 'POST':
        try:
            data = json.loads(req.body)
            source = {
                'location': data.get('location'),
                'BEDROOM_NUM': as_float(data.get('bedroom')),
                'BALCONY_NUM': as_float(data.get('balcony')),
                'AREA': as_float(data.get('area')),
                'AGE': data.get('age'),
                'FURNISH': data.get('furnish'),
                'amenity_luxury': data.get('amenity'),
                'FLOOR_NUM': data.get('floor'),
                'PRICE': as_float(data.get('PRICE')),
            }

            properties = get_property_data()
            prioritized = [
                item for item in properties
                if normalize_string(item.get('location')) == normalize_string(source['location'])
                or as_float(item.get('BEDROOM_NUM')) == source['BEDROOM_NUM']
            ]
            candidates = prioritized or properties
            return JsonResponse(ranked_recommendations(source, candidates, top_n), safe=False)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as exc:
            return JsonResponse({'error': str(exc)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
