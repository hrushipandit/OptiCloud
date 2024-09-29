import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dummy data for the API response
const dummyData = {
  CPUUtilization: { current: 65, optimized: 45 },
  DiskIO: { current: 70, optimized: 55 },
  NetworkUsage: { current: 60, optimized: 40 },
  InstanceHealth: { current: 80, optimized: 90 },
};

// Function to generate chart data
const getChartData = (current: number, optimized: number) => {
  return {
    labels: ["Current Usage", "Optimized Usage"],
    datasets: [
      {
        
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

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
}
interface MetricDetail {
  Recommendation: string;
  Current_Usage: number;
  Optimized_Usage: number;
}

interface OptimizationRecommendations {
  CPU_Utilization: MetricDetail;
  Disk_IO: MetricDetail;
  Network_Usage: MetricDetail;
  Instance_Health: MetricDetail;
}

interface CarbonFootprintReduction {
  Reduction_Percentage: number;
}

interface ApiResponse {
  Optimization_Recommendations: OptimizationRecommendations;
  Carbon_Footprint_Reduction: CarbonFootprintReduction;
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roleArn, setRoleArn] = useState<string>("");
  const user = session?.user as ExtendedUser;
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [user_metrics, setUserMetrics] = useState<any>(null);
  const [metrics, setMetrics] = useState<OptimizationRecommendations | null>(null);

  // Function to fetch the roleArn from the backend
  const fetchRoleArn = async (userId: string | null) => {
    if (!userId) return;

    try {
      const response = await fetch(
        "http://localhost:8000/api/get-user-role-arn/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId, // Send the user ID to the backend to fetch the roleArn
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        setRoleArn(data.roleArn); // Set the fetched roleArn

        setResponseMessage("Role ARN fetched successfully.");
      } else {
        const errorData = await response.json();
        setResponseMessage(errorData.message || "Failed to fetch Role ARN.");
      }
    } catch (error) {
      console.error("Error fetching Role ARN:", error);
      setResponseMessage("An error occurred while fetching the Role ARN.");
    }
  };

  // Function to fetch user metrics from the backend
const fetchUserMetrics = async(userId: string | null) => {
  if (!userId) return;
  try {
    // Send POST request to the backend API
    const response = await fetch("http://localhost:8000/api/get-user-metrics/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,  // Pass the user.id in the request body
      }),
    });
    if (response.ok) {
      const data = await response.json();
      //console.log("these are metrics:", data.aws_metrics); 
      const aws_metrics = data.aws_metrics;
      console.log("var is ", aws_metrics);
      setMetrics(aws_metrics.Optimization_Recommendations);

      setResponseMessage("Metrics fetched successfully.");
    } else {
      const errorData = await response.json();
      setResponseMessage(errorData.message || "Failed to fetch metrics.");
    }

    // if (response.ok) {
    //   const data = await response.json();
    //   console.log("User metrics fetched successfully", data);
    //   return data; // Return the fetched metrics data
    // } else {
    //   const errorData = await response.json();
    //   console.error("Failed to fetch user metrics:", errorData.message);
    //   return null;
    // }
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    return null;
  }
}


  useEffect(() => {
    if (status === "authenticated" && user?.id) {
      console.log("triggered");
      fetchRoleArn(user.id); // Fetch the roleArn once the user is authenticated
      fetchUserMetrics(user.id);
    }
  }, [status, user?.id]);

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
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex flex-col">
      {/* Navigation and other UI elements */}
      <main className="flex-grow p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        {Object.entries(metrics!).map(([key, value]) => (
          <div key={key} className="w-full md:w-1/2 p-4">
            <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg rounded-lg p-6 mb-6 border border-gray-200 border-opacity-30">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">{key.replace(/_/g, ' ')}</h3>
              <Bar
                data={getChartData(value.Current_Usage, value.Optimized_Usage)}
                options={{
                  indexAxis: 'y',
                  scales: {
                    x: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.2)",
                      },
                      ticks: {
                        color: "white",
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.2)",
                      },
                      ticks: {
                        color: "white",
                      },
                    },
                  },
                }}
                height={50}
              />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}