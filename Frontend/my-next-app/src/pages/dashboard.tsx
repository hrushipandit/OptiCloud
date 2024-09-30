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

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
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
  const [user_metrics, setUserMetrics] = useState<any | null>(null);


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
      
      setUserMetrics(data.aws_metrics);
      console.log("these are metrics:", data.aws_metrics); 
      console.log("these are metrics:", user_metrics); 
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
  if (!user_metrics) {
    return <div>Loading all necessary data...</div>;
  }
  if (user_metrics) {
    console.log("Before JSX,",user_metrics);
  }


  return (
    
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex flex-col">
      {/* Menu Bar */}
      <nav className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
        {/* App Name */}
        <div className="text-xl font-extrabold text-teal-400">OptiCloud</div>

        {/* Menu Items */}
        <ul className="flex space-x-8 text-gray-300">
          <li>
            <a href="/dashboard" className="hover:text-white transition-all">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/aws-setup" className="hover:text-white transition-all">
              Setup
            </a>
          </li>
        </ul>

        {/* Logout Button */}
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <h2 className="text-2xl font-semibold mb-6 text-teal-400">
          AWS CloudWatch Metrics
        </h2>

        {/* Split the screen into two halves */}
        <div className="flex space-x-6">
          {/* Left Side - CPU Utilization and Disk I/O */}
          <div className="w-1/2">
            {/* CPU Utilization Graph */}
            <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg rounded-lg p-6 mb-6 border border-gray-200 border-opacity-30">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">
                CPU Utilization
              </h3>
              <Bar
                data={{
                  labels: ["Current", "Optimized"],
                  datasets: [
                    {
                      label: "CPU Utilization",
                      data: [
                        user_metrics?.Optimization_Recommendations?.CPU_Utilization?.Current_Usage || 0, 
                        user_metrics?.Optimization_Recommendations?.CPU_Utilization?.Optimized_Usage || 0
                      ],
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(54, 162, 235, 0.7)",
                      ],
                      borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
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

            {/* Disk I/O Graph */}
            <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg rounded-lg p-6 mb-6 border border-gray-200 border-opacity-30">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">
                Disk I/O
              </h3>
              <Bar
                data={{
                  labels: ["Current", "Optimized"],
                  datasets: [
                    {
                      label: "Disk I/O",
                      data: [
                        user_metrics?.Optimization_Recommendations?.Disk_IO?.Current_Usage || 0, 
    user_metrics?.Optimization_Recommendations?.Disk_IO?.Optimized_Usage || 0
                      ],
                      backgroundColor: [
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                      ],
                      borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
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

          {/* Right Side - Network Usage and Instance Health */}
          <div className="w-1/2">
            {/* Network Usage Graph */}
            <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg rounded-lg p-6 mb-6 border border-gray-200 border-opacity-30">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">
                Network Usage
              </h3>
              <Bar
                data={{
                  labels: ["Current", "Optimized"],
                  datasets: [
                    {
                      label: "Network Usage",
                      data: [
                        user_metrics?.Optimization_Recommendations?.Network_Usage?.Current_Usage || 0, 
    user_metrics?.Optimization_Recommendations?.Network_Usage?.Optimized_Usage || 0

                      ],
                      backgroundColor: [
                        "rgba(255, 206, 86, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                      ],
                      borderColor: [
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
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

            {/* Instance Health Graph */}
            <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg rounded-lg p-6 mb-6 border border-gray-200 border-opacity-30">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">
                Instance Health
              </h3>
              <Bar
                data={{
                  labels: ["Current", "Optimized"],
                  datasets: [
                    {
                      label: "Instance Health",
                      data: [
                        user_metrics?.Optimization_Recommendations?.Instance_Health?.Current_Usage || 0, 
    user_metrics?.Optimization_Recommendations?.Instance_Health?.Optimized_Usage || 0
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 99, 132, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
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
        </div>
      </main>
    </div>
  );
}