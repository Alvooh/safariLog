import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { MapPin, Truck, Clock } from "lucide-react";
import MapSelector from "../components/MapSelector";
import { tripService } from "../services/api";
import type { TripFormData } from "../types/trip";

const TripFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<TripFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-1.286389, 36.817223]);
  const [pickupLocation, setPickupLocation] = useState<[number, number]>([-4.0435, 39.6682]);
  const [dropoffLocation, setDropoffLocation] = useState<[number, number]>([-0.1022, 34.7617]);

  const onSubmit = async (data: TripFormData) => {
    try {
      setIsSubmitting(true);

      // Ensure coordinates are properly formatted
      if (
        !Array.isArray(currentLocation) || currentLocation.length !== 2 ||
        !Array.isArray(pickupLocation) || pickupLocation.length !== 2 ||
        !Array.isArray(dropoffLocation) || dropoffLocation.length !== 2
      ) {
        throw new Error("Invalid coordinate format");
      }

      const payload: TripFormData = {
        cycle_hours: Math.round(data.cycle_hours),
        current_location: currentLocation.join(","),  // ✅ Convert to string
        pickup_location: pickupLocation.join(","),    // ✅ Convert to string
        dropoff_location: dropoffLocation.join(","),  // ✅ Convert to string
      };

      console.log("🚀 Sending Payload:", payload);
      const tripSummary = await tripService.createTrip(payload);

      // Navigate to the TripSummaryPage with the tripId
      navigate(`/trips/${tripSummary.tripId}`);
    } catch (error: any) {
      console.error("❌ Failed to create trip:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Plan New Trip</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Current Location */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="text-blue-900 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Current Location</h2>
            </div>
            <MapSelector position={currentLocation} onPositionChange={setCurrentLocation} />
          </div>

          {/* Pickup Location */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <Truck className="text-blue-900 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Pickup Location</h2>
            </div>
            <MapSelector position={pickupLocation} onPositionChange={setPickupLocation} />
          </div>

          {/* Dropoff Location */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="text-blue-900 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Dropoff Location</h2>
            </div>
            <MapSelector position={dropoffLocation} onPositionChange={setDropoffLocation} />
          </div>

          {/* Cycle Hours */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Clock className="text-blue-900 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Current Cycle Hours</h2>
            </div>
            <div className="max-w-xs">
              <input
                type="number"
                step="0.5"
                min="0"
                max="70"
                {...register("cycle_hours", {
                  required: "Current cycle hours is required",
                  min: { value: 0, message: "Hours must be at least 0" },
                  max: { value: 70, message: "Hours cannot exceed 70" },
                })}
                className="input"
                placeholder="Enter current cycle hours"
              />
              {errors.cycle_hours && (
                <p className="mt-1 text-sm text-red-600">{errors.cycle_hours.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Creating Trip..." : "Create Trip"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TripFormPage;