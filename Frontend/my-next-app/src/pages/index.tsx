import Link from "next/link";
import "../styles/globals.css";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
      <main className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-200 border-opacity-30">
        <h1 className="text-3xl font-bold text-teal-400 mb-6">
          Welcome to OptiCloud
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          To access your account, please sign in.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition"
        >
          Sign in with Google
        </button>
      </main>
    </div>
  );
}
