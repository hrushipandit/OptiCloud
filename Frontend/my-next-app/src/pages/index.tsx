import Link from "next/link";
import styles from "../styles/Home.module.css"; // Make sure you have corresponding CSS
import { signIn } from "next-auth/react"; // Make sure you have corresponding CSS
import "../styles/globals.css";

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
