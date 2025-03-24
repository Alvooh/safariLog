import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { tripService } from "../services/api";
import LogSheet from "../components/LogSheet";
import { TripSummary } from "../types/trip";
import { LatLngTuple } from "leaflet";

interface TripSummaryPageProps {
  tripSubmitted?: boolean;
}

const TripSummaryPage: React.FC<TripSummaryPageProps> = ({ tripSubmitted }) => {
  const { tripId } = useParams<{ tripId: string }>();

  if (!tripId) {
    return <p>Trip ID is missing.</p>;
  }

  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripService.getTrip(tripId);
        console.log("Fetched Trip Data:", data);
        setTrip(data);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      }
    };
    fetchTrip();
  }, [tripId, tripSubmitted]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!trip) return <p>Loading trip details...</p>;

  const { route, logs } = trip;

  // Extract start and end coordinates from the route
  const startCoordinates: LatLngTuple = [
    parseFloat(route.start_location.split(",")[0]),
    parseFloat(route.start_location.split(",")[1]),
  ];
  const endCoordinates: LatLngTuple = [
    parseFloat(route.end_location.split(",")[0]),
    parseFloat(route.end_location.split(",")[1]),
  ];

  // Combine start, stops, and end coordinates into polylinePositions
  const polylinePositions: LatLngTuple[] = [
    startCoordinates,
    ...route.stops
      .map((stop) => {
        if (!stop.location) {
          console.warn("Missing location for stop:", stop);
          return null;
        }
        const [lat, lng] = stop.location.split(",").map(Number);
        if (isNaN(lat) || isNaN(lng)) {
          console.warn("Invalid coordinates:", stop.location);
          return null;
        }
        return [lat, lng] as LatLngTuple;
      })
      .filter((coord): coord is LatLngTuple => coord !== null), // Filter out null values
    endCoordinates,
  ];

  const defaultCenter: LatLngTuple = [1.2921, 36.8219]; // Default center (Nairobi, Kenya)
  const defaultZoom = 7;

  const mapCenter = polylinePositions.length > 0 ? polylinePositions[0] : defaultCenter;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Trip Summary</h1>

      {isClient && polylinePositions.length > 0 ? (
        <MapContainer center={mapCenter} zoom={defaultZoom} className="h-96 w-full mb-6">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline positions={polylinePositions} color="blue" />

          {/* Marker for Start Point */}
          <Marker position={startCoordinates}>
            <Popup>Start Point</Popup>
          </Marker>

          {/* Marker for End Point */}
          <Marker position={endCoordinates}>
            <Popup>End Point</Popup>
          </Marker>

          {/* Markers for Stops */}
          {route.stops.map((stop, index) => {
            if (!stop.location) return null;
            const [lat, lng] = stop.location.split(",").map(Number);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker key={index} position={[lat, lng]}>
                <Popup>
                  {stop.type === "fuel" ? "Fuel Stop" : "Rest Stop"} <br /> {stop.location}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}

      <div className="bg-white p-4 shadow-lg rounded-lg">
        <p><strong>Distance:</strong> {route.distance} miles</p>
        <p><strong>Estimated Time:</strong> {route.duration} hours</p>
        <p><strong>Stops:</strong> {route.stops.length} (Fuel & Rest)</p>
      </div>

      <h2 className="text-2xl font-semibold mt-6">Electronic Log Sheets</h2>
      {logs.map((log, index) => (
        <LogSheet key={index} logData={log} />
      ))}
    </div>
  );
};

export default TripSummaryPage;