from django.contrib import admin
from django.urls import path, include

# These routes expose the scoring API and the recommendation API under /api/.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('prediction.urls')),
    path('api/recommend/', include('Recommendation.urls')),
]

