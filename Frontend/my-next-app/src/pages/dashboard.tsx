import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dummy data for the API response
const dummyData = {
  CPUUtilization: { current: 65, optimized: 45 },
  DiskIO: { current: 70, optimized: 55 },
  NetworkUsage: { current: 60, optimized: 40 },
  InstanceHealth: { current: 80, optimized: 90 },
};

// Function to generate chart data
const getChartData = (label: string, current: number, optimized: number) => {
  return {
    labels: ["Current Usage", "Optimized Usage"],
    datasets: [
      {
        label,
        data: [current, optimized],
        backgroundColor: ["#FF6384", "#36A2EB"], // Colors for bars
      },
    ],
  };
};

// Define the User interface for TypeScript
interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
}

// Function to send user data to the backend
async function sendDataToBackend(user: User) {
  try {
    const response = await fetch("http://localhost:8000/user-data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Data posted successfully", data);
  } catch (error) {
    console.error("Error posting data:", error);
  }
}

// Dashboard component
export default function Dashboard() {
  const { data: session, status } = useSession(); // Get session and status from next-auth
  const router = useRouter(); // For redirection

  // Handle session data on component mount
  useEffect(() => {
    const handleSessionData = async () => {
      if (status === "authenticated" && session?.user) {
        console.log("Authenticated Session Data:", session.user);
        await sendDataToBackend(session.user); // Send user data to backend
      } else if (status === "unauthenticated") {
        router.push("/api/auth/signin"); // Redirect to sign-in if unauthenticated
      }
    };

    handleSessionData();
  }, [session, status, router]);

  // Loading state while session is being checked
  if (status === "loading") {
    return <div>Loading...</div>; // Optionally provide a better loading indicator
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Section */}
      <header className="relative p-4 bg-gray-50">
        {/* Buttons in the top-right corner */}
        {session && (
          <div className="absolute top-4 right-4 space-x-2">
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition"
            >
              Log Out
            </button>
            <Link href="/aws-setup" legacyBehavior>
              <a className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition">
                AWS Setup
              </a>
            </Link>
          </div>
        )}
        {/* Welcome message in the center */}
        <h1 className="text-2xl font-semibold text-center text-blue-600">
          Welcome to Dashboard
        </h1>
      </header>

      {/* Main Content - Dashboard Section */}
      <main className="flex-grow p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">AWS CloudWatch Metrics</h2>

        {/* Split the screen into two halves */}
        <div className="flex space-x-4">
          {/* Left Side - CPU Utilization and Disk I/O */}
          <div className="w-1/2">
            {/* CPU Utilization Graph */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">CPU Utilization</h3>
              <Bar
                data={getChartData(
                  "CPU Utilization",
                  dummyData.CPUUtilization.current,
                  dummyData.CPUUtilization.optimized
                )}
                options={{ indexAxis: "y" }}
                height={50}
              />
            </div>

            {/* Disk I/O Graph */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Disk I/O</h3>
              <Bar
                data={getChartData("Disk I/O", dummyData.DiskIO.current, dummyData.DiskIO.optimized)}
                options={{ indexAxis: "y" }}
                height={50}
              />
            </div>
          </div>

          {/* Right Side - Network Usage and Instance Health */}
          <div className="w-1/2">
            {/* Network Usage Graph */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Network Usage</h3>
              <Bar
                data={getChartData(
                  "Network Usage",
                  dummyData.NetworkUsage.current,
                  dummyData.NetworkUsage.optimized
                )}
                options={{ indexAxis: "y" }}
                height={50}
              />
            </div>

            {/* Instance Health Graph */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Instance Health</h3>
              <Bar
                data={getChartData(
                  "Instance Health",
                  dummyData.InstanceHealth.current,
                  dummyData.InstanceHealth.optimized
                )}
                options={{ indexAxis: "y" }}
                height={50}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
