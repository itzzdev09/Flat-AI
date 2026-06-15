from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid

from ml.property_data import get_property_data

predictions_store = {}

AGE_ALIASES = {
    'relatively new property': 'Relatively New',
    'relatively new': 'Relatively New',
    'new property': 'New Property',
    'moderately old': 'Moderately Old',
    'old property': 'Old Property',
}

FURNISH_ALIASES = {
    'semi-furnished': 'Semi Furnished',
    'semi furnished': 'Semi Furnished',
    'fully furnished': 'Fully furnished',
    'luxury furnished': 'Luxury furnished',
    'unfurnished': 'Unfurnished',
}

AMENITY_FACTORS = {
    'Low': 0.94,
    'Medium': 1.0,
    'High': 1.08,
}

FURNISH_FACTORS = {
    'Unfurnished': 0.95,
    'Semi Furnished': 1.0,
    'Luxury furnished': 1.09,
    'Fully furnished': 1.06,
}

AGE_FACTORS = {
    'New Property': 1.08,
    'Relatively New': 1.03,
    'Moderately Old': 0.97,
    'Old Property': 0.92,
}

FLOOR_FACTORS = {
    'Low Floor': 0.98,
    'Mid Floor': 1.0,
    'High Floor': 1.03,
}

def as_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_string(value):
    return str(value or '').strip()


def normalize_age(value):
    normalized = normalize_string(value)
    return AGE_ALIASES.get(normalized.lower(), normalized)


def normalize_furnish(value):
    normalized = normalize_string(value)
    return FURNISH_ALIASES.get(normalized.lower(), normalized)


def floor_band_from_number(value):
    floor_num = as_float(value, 0)
    if floor_num <= 4:
        return 'Low Floor'
    if floor_num <= 10:
        return 'Mid Floor'
    return 'High Floor'


def normalize_query(data):
    return {
        'location': normalize_string(data.get('location')),
        'bedroom': as_float(data.get('bedroom'), 0),
        'balcony': as_float(data.get('balcony'), 0),
        'area': as_float(data.get('area'), 0),
        'age': normalize_age(data.get('age')),
        'furnish': normalize_furnish(data.get('furnish')),
        'amenity': normalize_string(data.get('amenity')),
        'floor': normalize_string(data.get('floor')),
    }


def comparable_score(source, item):
    score = 0.0

    if normalize_string(item.get('location')).lower() == source['location'].lower():
        score += 3.5
    if as_float(item.get('BEDROOM_NUM')) == source['bedroom']:
        score += 2.4
    if normalize_furnish(item.get('FURNISH')) == source['furnish']:
        score += 1.2
    if normalize_age(item.get('AGE')) == source['age']:
        score += 1.0
    if normalize_string(item.get('amenity_luxury')) == source['amenity']:
        score += 0.9
    if floor_band_from_number(item.get('FLOOR_NUM')) == source['floor']:
        score += 0.7
    if as_float(item.get('BALCONY_NUM')) == source['balcony']:
        score += 0.5

    area_gap_ratio = abs(as_float(item.get('AREA')) - source['area']) / max(source['area'], 1)
    score += max(0.0, 2.0 - (area_gap_ratio * 2.4))

    return score


def estimate_price(data):
    source = normalize_query(data)
    properties = get_property_data()

    scored_candidates = []
    for item in properties:
        price_per_sqft = as_float(item.get('Price_per_sqft'))
        if price_per_sqft <= 0:
            continue
        score = comparable_score(source, item)
        if score > 0:
            scored_candidates.append((score, item))

    scored_candidates.sort(key=lambda pair: pair[0], reverse=True)
    top_matches = scored_candidates[:60] if scored_candidates else []

    if top_matches:
        weighted_total = sum(score * as_float(item.get('Price_per_sqft')) for score, item in top_matches)
        weight_sum = sum(score for score, _ in top_matches)
        base_price_per_sqft = weighted_total / max(weight_sum, 1)
    else:
        price_points = [as_float(item.get('Price_per_sqft')) for item in properties if as_float(item.get('Price_per_sqft')) > 0]
        base_price_per_sqft = sum(price_points) / len(price_points) if price_points else 5000

    bedroom_factor = 0.92 + min(source['bedroom'], 6) * 0.04
    balcony_factor = 1 + min(source['balcony'], 4) * 0.01
    amenity_factor = AMENITY_FACTORS.get(source['amenity'], 1.0)
    furnish_factor = FURNISH_FACTORS.get(source['furnish'], 1.0)
    age_factor = AGE_FACTORS.get(source['age'], 1.0)
    floor_factor = FLOOR_FACTORS.get(source['floor'], 1.0)

    adjusted_price_per_sqft = (
        base_price_per_sqft
        * bedroom_factor
        * balcony_factor
        * amenity_factor
        * furnish_factor
        * age_factor
        * floor_factor
    )

    predicted_rupees = source['area'] * adjusted_price_per_sqft
    predicted_crore = predicted_rupees / 10000000
    return round(max(predicted_crore, 0.01), 2)


@csrf_exempt
def submit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            normalized = normalize_query(data)
            prediction = estimate_price(normalized)

            session_id = str(uuid.uuid4())
            predictions_store[session_id] = prediction

            return JsonResponse({'session_id': session_id, 'prediction': prediction})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as exc:
            return JsonResponse({'error': str(exc)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)


def fetch_data(request):
    if request.method == 'GET':
        session_id = request.GET.get('session_id')
        prediction = predictions_store.get(session_id)
        if prediction is None:
            return JsonResponse({'error': 'No data available'}, status=404)
        return JsonResponse({'prediction': prediction})
    return JsonResponse({'error': 'Invalid request method'}, status=400)
