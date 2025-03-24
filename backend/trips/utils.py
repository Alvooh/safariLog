import requests
from datetime import datetime, timedelta
import os

ORS_API_KEY = os.environ.get("ORS_API_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"
FUEL_INTERVAL = 1000  # Fueling every 1000 miles
DRIVING_HOURS_LIMIT = 11  # Max driving hours per day
TOTAL_CYCLE_HOURS = 70  # 70-hour work cycle

def parse_coordinates(coord):
    """Converts a coordinate string to a tuple (latitude, longitude)."""
    if isinstance(coord, str):
        try:
            lat, lon = map(float, coord.split(","))
            return (lat, lon)
        except ValueError:
            return None  # Invalid coordinate
    elif isinstance(coord, (list, tuple)) and len(coord) == 2:
        return tuple(coord)  # Already a valid tuple
    return None

def get_route(start, pickup, dropoff):
    """Fetches route details from OpenRouteService."""

    # Convert string coordinates to tuples
    start = parse_coordinates(start)
    pickup = parse_coordinates(pickup)
    dropoff = parse_coordinates(dropoff)

    # Ensure all coordinates are valid
    if not start or not pickup or not dropoff:
        return {"error": "Invalid coordinates provided."}

    try:
        # Convert (lat, lon) to (lon, lat) for ORS
        start_lon_lat = f"{start[1]},{start[0]}"  # Swap lat and lon
        dropoff_lon_lat = f"{dropoff[1]},{dropoff[0]}"  # Swap lat and lon

        # Debugging: Print coordinates before making the request
        print(f"Start (lon, lat): {start_lon_lat}")
        print(f"Dropoff (lon, lat): {dropoff_lon_lat}")

        # Build the request URL
        url = f"{ORS_BASE_URL}?api_key={ORS_API_KEY}&start={start_lon_lat}&end={dropoff_lon_lat}"

        print(f"Requesting ORS route: {url}")  # Debugging

        response = requests.get(url)

        # Debugging: Print response details
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Data: {response.text}")

        if response.status_code == 200:
            data = response.json()

            # Check if 'features' exists and is not empty
            if 'features' not in data or not data['features']:
                return {"error": "No route found. Check locations."}

            # Extract the first feature
            feature = data['features'][0]

            # Ensure 'summary' exists
            if 'properties' not in feature or 'summary' not in feature['properties']:
                return {"error": "Invalid route data received."}

            # Extract distance & duration
            route_summary = feature['properties']['summary']
            distance = route_summary['distance'] / 1609  # Convert meters to miles
            duration = route_summary['duration'] / 3600  # Convert seconds to hours

            # Extract the full route geometry
            route_coordinates = feature['geometry']['coordinates']

            return {
                "distance": round(distance, 2),
                "duration": round(duration, 2),
                "route_coordinates": route_coordinates,  # Add route coordinates to the response
            }

        else:
            return {
                "error": f"Failed to fetch route. HTTP {response.status_code}",
                "details": response.text
            }

    except Exception as e:
        return {"error": f"Exception occurred: {str(e)}"}

def calculate_stops(distance, duration, route_coordinates):
    """Determine rest and fuel stops along the route with actual coordinates."""
    stops = []
    driving_hours = 0
    miles_covered = 0

    # Debugging: Log input parameters
    print(f"Distance: {distance}, Duration: {duration}")
    print(f"Route Coordinates Length: {len(route_coordinates)}")

    while miles_covered < distance:
        # Ensure index is within bounds
        index = min(int((miles_covered / distance) * len(route_coordinates)), len(route_coordinates) - 1)
        current_coords = route_coordinates[index]

        # Debugging: Log current coordinates
        print(f"Miles Covered: {miles_covered}, Current Coords: {current_coords}")

        # Add fuel stop every 1000 miles
        if miles_covered > 0 and miles_covered % FUEL_INTERVAL < 50:
            stops.append({
                "type": "fuel",
                "location": f"{current_coords[1]},{current_coords[0]}",  # lat,lng
                "duration": 0.5,
            })
            print(f"Added Fuel Stop at Mile {miles_covered}")

        # Add rest stop every 11 hours of driving
        if driving_hours >= DRIVING_HOURS_LIMIT:
            stops.append({
                "type": "rest",
                "location": f"{current_coords[1]},{current_coords[0]}",  # lat,lng
                "duration": 10,
            })
            print(f"Added Rest Stop at Mile {miles_covered}")
            driving_hours = 0  # Reset after rest

        # Increment miles and driving hours
        miles_covered += 50  # Simulate 50 miles per hour driving speed
        driving_hours += 1

    # Ensure at least one stop for long trips
    if distance >= FUEL_INTERVAL and not any(stop['type'] == 'fuel' for stop in stops):
        stops.append({
            "type": "fuel",
            "location": f"{route_coordinates[-1][1]},{route_coordinates[-1][0]}",
            "duration": 0.5,
        })
        print("Added Final Fuel Stop")

    # Debugging: Log the final stops
    print(f"Final Stops: {stops}")

    return stops

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