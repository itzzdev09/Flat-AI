from django.urls import path
from .views import getRecommendations,prediction_recommendation

urlpatterns = [
    path('recommendations/<str:PROP_ID>/', getRecommendations, name='get_recommendations'),
    path('Prediction-recommendations/', prediction_recommendation, name='prediction_recommendation'),
]
