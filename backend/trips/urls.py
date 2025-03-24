from django.urls import path
from .views import TripView

urlpatterns = [
    path('api/trips/', TripView.as_view(), name='trip-create'),
    path('api/trips/<int:id>/', TripView.as_view(), name='trip-detail'),
    
]
