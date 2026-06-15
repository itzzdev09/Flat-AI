from django.urls import path
from .views import *

urlpatterns = [
    path('submit/', submit),
     path('fetchdata/', fetch_data, name='fetch_data'),
]
