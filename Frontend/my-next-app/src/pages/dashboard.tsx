import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
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
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Welcome to Dashboard</h1>
        {session ? (
          <div>
            <p>Welcome, {session?.user?.name}! You are logged in.</p>
            <button onClick={() => signOut()} className={styles.formButton}>
              Log Out
            </button>
            <button
              onClick={() => signIn("google")}
              className={styles.formButton}
            >
              Click Here to set up AWS Monitoring
            </button>
            {/* Include other user-specific or SSO actions here */}
          </div>
        ) : (
          <div>
            <p>Redirecting to login...</p>
          </div>
        )}
      </main>
    </div>
  );
}
