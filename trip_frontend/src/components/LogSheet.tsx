import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, 
} from "chart.js";

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
);

interface LogData {
  date: string;
  startTime: string;
  endTime: string;
  status: "driving" | "on_duty" | "off_duty" | "sleeper";
  location: string;
  remarks: string;
}

interface LogSheetProps {
  logData: LogData;
}

const LogSheet: React.FC<LogSheetProps> = ({ logData }) => {
  const { date, startTime, endTime, status, location, remarks } = logData;

  // Create labels and data for the chart
  const labels = [startTime, endTime];
  const dataValues = [
    status === "driving" ? 3 : status === "on_duty" ? 2 : status === "off_duty" ? 1 : 0,
    status === "driving" ? 3 : status === "on_duty" ? 2 : status === "off_duty" ? 1 : 0,
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Log Status",
        data: dataValues,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.3)",
        fill: true, 
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Log Status Over Time",
      },
    },
  };

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">{date}</h3>
      <Line data={data} options={options} />
      <p><strong>Start Time:</strong> {startTime}</p>
      <p><strong>End Time:</strong> {endTime}</p>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Remarks:</strong> {remarks}</p>
    </div>
  );
};

export default LogSheet;