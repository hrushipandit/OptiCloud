import Link from "next/link";
import { signIn } from "next-auth/react";
import "../styles/globals.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <main className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Welcome to Opticloud
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          To access your account, please sign in.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Sign in with Google
        </button>
      </main>
    </div>
  );
}
