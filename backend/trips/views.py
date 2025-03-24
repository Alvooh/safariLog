from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Trip
from .serializers import TripSerializer
from .utils import get_route, generate_log_sheets, calculate_stops

# Function to generate log sheets
def generate_log_sheets(distance, duration, current_cycle_hours, route_coordinates):
    """Creates electronic log sheets based on driving time and trip progress."""
    logs = []
    total_hours = 0
    current_date = datetime.now().date()  # Start from today
    start_time = datetime.strptime("06:00", "%H:%M").time()  # Default start time
    driving_hours = current_cycle_hours  # Use the current cycle hours

    while total_hours < duration and distance > 0:
        # Calculate end time for the current log entry
        end_time = (datetime.combine(current_date, start_time) + timedelta(hours=11)).time()

        # Determine the driver's status
        if driving_hours >= 11:  # Max driving hours per day
            status = "off_duty"  # Driver must take a rest
            remarks = "Rest break after 11 hours of driving"
            driving_hours = 0  # Reset driving hours after rest
        else:
            status = "driving"
            remarks = "On the road"

        # Add log entry
        logs.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "startTime": start_time.strftime("%H:%M"),
            "endTime": end_time.strftime("%H:%M"),
            "status": status,
            "location": "On the road",  # Update dynamically if needed
            "remarks": remarks,
        })

        # Update for the next log entry
        total_hours += 11
        distance -= 550  # Assume 50 mph speed
        driving_hours += 11  # Increment driving hours
        current_date += timedelta(days=1)  # Move to the next day
        start_time = datetime.strptime("06:00", "%H:%M").time()  # Reset start time

    return logs

# API View for Trip
class TripView(APIView):
    def post(self, request):
        # Validate and save trip data
        serializer = TripSerializer(data=request.data)
        if serializer.is_valid():
            trip = serializer.save()

            # Get route information
            route = get_route(
                trip.current_location,
                trip.pickup_location,
                trip.dropoff_location
            )

            # Check if route data is valid
            if "error" in route:
                return Response({"error": route["error"]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Calculate stops (fuel and rest stops)
            stops = calculate_stops(route["distance"], route["duration"], route["route_coordinates"])

            # Generate log sheets
            logs = generate_log_sheets(
                route["distance"], 
                route["duration"], 
                current_cycle_hours=0,  # Provide the correct value or default to 0
                route_coordinates=route["route_coordinates"]  # Pass the route coordinates
            )

            # Combine all data into the response
            response_data = {
                "tripId": trip.id,  # Include the tripId in the response
                "route": {
                    "distance": route["distance"],  # in miles
                    "duration": route["duration"],  # in hours
                    "path": route.get("path", []),  # list of [lat, lng] coordinates
                    "stops": stops  # list of stops (fuel and rest)
                },
                "logs": logs  # list of log sheets
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None):
        # Handle GET request for a specific trip by ID
        if id is not None:
            try:
                trip = Trip.objects.get(id=id)
                serializer = TripSerializer(trip)

                # Get route information
                route = get_route(
                    trip.current_location,
                    trip.pickup_location,
                    trip.dropoff_location
                )

                # Calculate stops (fuel and rest stops)
                stops = calculate_stops(route["distance"], route["duration"], route["route_coordinates"])

                # Generate log sheets
                logs = generate_log_sheets(
                    route["distance"], 
                    route["duration"], 
                    current_cycle_hours=0,  # Provide the correct value or default to 0
                    route_coordinates=route["route_coordinates"]  # Pass the route coordinates
                )

                response_data = {
                    "tripId": trip.id,
                    "route": {
                        "distance": route["distance"],
                        "duration": route["duration"],
                        "path": route.get("path", []),
                        "stops": stops
                    },
                    "logs": logs
                }

                return Response(response_data, status=status.HTTP_200_OK)
            except Trip.DoesNotExist:
                return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Handle GET request for listing all trips
            trips = Trip.objects.all()  # Fetch all trips from the database
            serializer = TripSerializer(trips, many=True)  # Serialize the list of trips
            return Response(serializer.data, status=status.HTTP_200_OK)  # Return the serialized data