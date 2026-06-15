from django.urls import path
from .views import *

# Keep these paths short because the React app calls them directly through /api/.
urlpatterns = [
    path('submit/', submit),
    path('fetchdata/', fetch_data, name='fetch_data'),
]
