import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the Trip interface based on the Django model
interface Trip {
  id: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours: number;
  created_at: string; 
}

const DashboardPage = () => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<Trip[]>([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all trips
        const tripsRes = await axios.get('https://safarilog.onrender.com/api/trips/');
        const trips = tripsRes.data;

        // Debug: Log the API response
        console.log('API Response:', trips);

        // Validate the API response
        if (!Array.isArray(trips)) {
          console.error('Invalid API response: Expected an array of trips');
          setRecentActivity([]); // Fallback to an empty array
          return;
        }

        // Process data for the chart (monthly trips)
        const monthlyTrips = calculateMonthlyTrips(trips);
        setChartData({
          labels: Object.keys(monthlyTrips),
          datasets: [
            {
              label: 'Trips Created',
              data: Object.values(monthlyTrips),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });

        // Process recent activity (last 5 trips)
        const recentTrips = trips
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by creation date (newest first)
          .slice(0, 5); // Get the 5 most recent trips
        setRecentActivity(recentTrips);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRecentActivity([]); // Fallback to an empty array on error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
  }, []);

  // Helper function to calculate monthly trips
  const calculateMonthlyTrips = (trips: Trip[]): { [month: string]: number } => {
    const monthlyTrips: { [month: string]: number } = {};

    trips.forEach((trip) => {
      const date = new Date(trip.created_at);
      const month = date.toLocaleString('default', { month: 'long' }); // Get month name

      if (!monthlyTrips[month]) {
        monthlyTrips[month] = 0;
      }
      monthlyTrips[month]++;
    });

    return monthlyTrips;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Monthly Trips Created' },
    },
  };

  if (loading) {
    return <p>Loading dashboard...</p>; // Show loading state
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto p-6"
    >
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800">Total Trips</h2>
          <p className="text-3xl font-bold text-blue-900">{recentActivity.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800">Active Trips</h2>
          <p className="text-3xl font-bold text-green-600">
            {recentActivity.filter((trip) => trip.cycle_hours > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800">Completed Trips</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {recentActivity.filter((trip) => trip.cycle_hours <= 0).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Trips Overview</h2>
        {chartData ? <Bar data={chartData} options={chartOptions} /> : <p>No data available.</p>}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((trip) => (
              <div key={trip.id} className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <p className="text-gray-800 font-medium">Trip ID: {trip.id}</p>
                  <p className="text-gray-600">From: {trip.pickup_location}</p>
                  <p className="text-gray-600">To: {trip.dropoff_location}</p>
                </div>
                <p className="text-gray-600">{new Date(trip.created_at).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No recent activity found.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;