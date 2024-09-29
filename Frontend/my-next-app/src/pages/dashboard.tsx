import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
}

async function sendDataToBackend(user: User) {
  try {
    const response = await fetch('http://localhost:8000/user-data/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Data posted successfully', data);
  } catch (error) {
    console.error('Error posting data:', error);
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleSessionData = async () => {
      if (status === "authenticated" && session?.user) {
        console.log("Authenticated Session Data:", session.user);
        await sendDataToBackend(session.user);
      } else if (status === "unauthenticated") {
        router.push("/api/auth/signin");
      }
    };

    handleSessionData();
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Optionally provide a better loading indicator
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <main className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-blue-600">
          Welcome to Dashboard
        </h1>
        {session ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome, {session.user?.name || 'Guest'}! You are logged in.
            </p>
            <button
              onClick={() => signOut()}
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            >
              Log Out
            </button>
            <Link href="/aws-setup" legacyBehavior>
              <a className="block w-full bg-blue-500 text-white py-2 rounded-md text-center hover:bg-blue-600 transition">
                Click Here to set up AWS Monitoring
              </a>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-700">Redirecting to login...</p>
          </div>
        )}
      </main>
    </div>
  );
}
