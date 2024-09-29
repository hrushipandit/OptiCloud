import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("Session Data:", session);

  useEffect(() => {
    // Check if the session is loaded and there is no user session
    if (status === "unauthenticated") {
      router.push("/api/auth/signin"); // Redirects to the sign-in page
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <main className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-blue-600">
          Welcome to Dashboard
        </h1>
        {session ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome, {session?.user?.name}! You are logged in.
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
