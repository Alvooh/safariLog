export interface TripFormData {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours: number;
}

export interface TripSummary {
  tripId: number; // Add id
  current_location: string; // Add current_location
  pickup_location: string; // Add pickup_location
  dropoff_location: string; // Add dropoff_location
  cycle_hours: number; // Add cycle_hours
  created_at: string; // Add created_at
  route: {
    distance: number;
    duration: number;
    start_location: string; // Add start location (format: "lat,lng")
    end_location: string;   // Add end location (format: "lat,lng")
    stops: Array<{
      type: 'rest' | 'fuel';
      location: string;     // Format: "lat,lng"
      duration: number;
    }>;
  };
  logs: Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: 'driving' | 'on_duty' | 'off_duty' | 'sleeper';
    location: string;
    remarks: string;
  }>;
}

// Additional types for DashboardPage
export interface Trip {
  id: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours: number;
  created_at: string; // Date as a string from the API
}

export interface MonthlyTrips {
  [month: string]: number; // Key: month name, Value: number of trips
}

export interface RecentActivity {
  id: number;
  tripId: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  date: string;
}