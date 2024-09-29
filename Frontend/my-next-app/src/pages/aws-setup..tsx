import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
}

const AwsSetup: React.FC = () => {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [roleArn, setRoleArn] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const user = session?.user as ExtendedUser;

  const validateArn = (arn: string) => {
    const arnRegex = /^arn:aws:iam::[0-9]{12}:role\/[A-Za-z_0-9+=,.@\-_/]+$/;
    return arnRegex.test(arn);
  };

  const handleSubmit = async () => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user) {
      setResponseMessage("You must be logged in to submit the Role ARN.");
      return;
    }

    if (!validateArn(roleArn)) {
      setResponseMessage("Invalid Role ARN. Please check the format.");
      return;
    }

    setLoading(true);
    setResponseMessage(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/receive-role-arn/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roleArn,
            user: {
              email: user.email,
              name: user.name,
              image: user.image,
              id: user.id,
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setResponseMessage("Role ARN successfully submitted.");
      } else {
        setResponseMessage(result.message || "Failed to submit Role ARN.");
      }
    } catch (error) {
      console.error("Error submitting Role ARN:", error);
      setResponseMessage("An error occurred while submitting the Role ARN.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetUpAwsClick = () => {
    setShowInput(true);
  };

  const handleRoleArnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoleArn(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex flex-col">
      {/* Solid Menu Bar */}
      <nav className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="text-xl font-extrabold text-teal-400">OptiCloud</div>
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
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 p-10 rounded-xl shadow-lg w-full max-w-lg border border-gray-200 border-opacity-30">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-teal-400">
            Set Up AWS Monitoring
          </h1>
          <p className="mb-6 text-lg text-gray-300 text-center">
            Click below to set up AWS CloudFormation and create the required IAM
            role:
          </p>

          <a
            href="https://console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/new?stackName=OptiCloudMonitoringRole&templateURL=https://opticloud-role-template.s3.us-west-1.amazonaws.com/OptiCloud.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-400 text-white font-semibold text-lg text-center py-3 rounded-lg hover:bg-blue-500 transition-all mb-6 shadow-md"
          >
            Set Up CloudFormation Stack
          </a>

          <p className="mb-4 text-lg text-gray-300 font-medium">
            After clicking the link, follow these steps to create the stack:
          </p>
          <ol className="list-decimal list-inside mb-6 text-gray-400">
            <li className="mb-2">
              Click <strong>Next</strong> on the "Create Stack" page.
            </li>
            <li className="mb-2">
              Click <strong>Next</strong> on the "Configure Stack Options" page.
            </li>
            <li className="mb-2">
              Check the box to <strong>Acknowledge</strong> IAM resource
              creation.
            </li>
            <li className="mb-2">
              Click <strong>Create Stack</strong>.
            </li>
            <li className="mb-2">Wait for stack creation to complete.</li>
          </ol>

          <p className="mb-6 text-lg text-gray-300 font-medium">
            Once the stack is created, copy the <strong>Role ARN</strong> from
            the output tab and paste it below.
          </p>

          <button
            onClick={handleSetUpAwsClick}
            className="w-full bg-teal-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-teal-600 transition mb-6 shadow-md"
          >
            Set up AWS Monitoring
          </button>

          {showInput && (
            <div className="mt-4">
              <input
                type="text"
                value={roleArn}
                onChange={handleRoleArnChange}
                placeholder="Enter AWS Role ARN"
                className="w-full p-3 border border-gray-600 rounded-lg mb-4 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-400 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-500 transition shadow-sm"
              >
                Submit
              </button>
            </div>
          )}

          {responseMessage && (
            <p className="text-center mt-4 text-red-500">{responseMessage}</p>
          )}

          {loading && (
            <div className="mt-4 flex justify-center">
              <span className="loader">Loading...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AwsSetup;
