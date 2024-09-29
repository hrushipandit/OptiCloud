import Link from "next/link";
import styles from "../styles/Home.module.css"; // Make sure you have corresponding CSS
import "../styles/globals.css";
import { useSession, signIn, signOut } from "next-auth/react";



export default function Home() {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Welcome to Opticloud</h1>
        <p>To access your account, please sign in.</p>
        <button onClick={() => signIn("google")} className={styles.formButton}>
          Sign in with Google
        </button>
      </main>
    </div>
  );
}
