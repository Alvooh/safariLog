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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripService.getTrip(tripId);
        console.log("Fetched Trip Data:", data);
        setTrip(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching trip details:", error);
        setError("Failed to load trip details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId, tripSubmitted]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!trip) return <p>No trip data available.</p>;
  if (!trip.route) return <p>Route information is missing.</p>;

  const { route, logs } = trip;

  // Safe coordinate extraction with fallbacks
  const getCoordinates = (locationString?: string): LatLngTuple | null => {
    if (!locationString) return null;
    const parts = locationString.split(",");
    if (parts.length !== 2) return null;
    
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return [lat, lng];
  };

  const startCoordinates = getCoordinates(route.start_location);
  const endCoordinates = getCoordinates(route.end_location);

  // Combine coordinates into polylinePositions
  const polylinePositions: LatLngTuple[] = [];
  
  if (startCoordinates) polylinePositions.push(startCoordinates);
  
  route.stops.forEach((stop) => {
    const coords = getCoordinates(stop.location);
    if (coords) polylinePositions.push(coords);
  });

  if (endCoordinates) polylinePositions.push(endCoordinates);

  const defaultCenter: LatLngTuple = [1.2921, 36.8219]; // Default center (Nairobi, Kenya)
  const defaultZoom = 7;

  const mapCenter = polylinePositions.length > 0 ? polylinePositions[0] : defaultCenter;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Trip Summary</h1>

      {isClient ? (
        <MapContainer center={mapCenter} zoom={defaultZoom} className="h-96 w-full mb-6">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {polylinePositions.length > 1 && (
            <Polyline positions={polylinePositions} color="blue" />
          )}

          {/* Marker for Start Point */}
          {startCoordinates && (
            <Marker position={startCoordinates}>
              <Popup>Start Point</Popup>
            </Marker>
          )}

          {/* Marker for End Point */}
          {endCoordinates && (
            <Marker position={endCoordinates}>
              <Popup>End Point</Popup>
            </Marker>
          )}

          {/* Markers for Stops */}
          {route.stops.map((stop, index) => {
            const coords = getCoordinates(stop.location);
            if (!coords) return null;
            
            return (
              <Marker key={index} position={coords}>
                <Popup>
                  {stop.type === "fuel" ? "Fuel Stop" : "Rest Stop"} <br /> 
                  {stop.location}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}

      <div className="bg-white p-4 shadow-lg rounded-lg">
        <p><strong>Distance:</strong> {route.distance || 'N/A'} miles</p>
        <p><strong>Estimated Time:</strong> {route.duration || 'N/A'} hours</p>
        <p><strong>Stops:</strong> {route.stops.length || 0} (Fuel & Rest)</p>
      </div>

      <h2 className="text-2xl font-semibold mt-6">Electronic Log Sheets</h2>
      {logs?.length > 0 ? (
        logs.map((log, index) => (
          <LogSheet key={index} logData={log} />
        ))
      ) : (
        <p>No log entries available.</p>
      )}
    </div>
  );
};

export default TripSummaryPage;