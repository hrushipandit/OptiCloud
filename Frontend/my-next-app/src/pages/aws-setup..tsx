import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

const AwsSetup: React.FC = () => {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false); // State to show/hide the input field
  const [roleArn, setRoleArn] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // To show a loading state while processing

  const validateArn = (arn: string) => {
    const arnRegex = /^arn:aws:iam::[0-9]{12}:role\/[A-Za-z_0-9+=,.@\-_/]+$/;
    return arnRegex.test(arn);
  };

  const handleSubmit = async () => {
    // 1. Validate the Role ARN
    if (!validateArn(roleArn)) {
      setResponseMessage("Invalid Role ARN. Please check the format.");
      return;
    }

    // 2. Set loading state
    setLoading(true);
    setResponseMessage(null);

    // 3. Logic to send the Role ARN to a backend or AWS
    try {
      const response = await fetch("/api/sendRoleArn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleArn }),
      });

      const result = await response.json();

      // 4. Handle response
      if (response.ok) {
        setResponseMessage("Role ARN successfully submitted.");
      } else {
        setResponseMessage(result.message || "Failed to submit Role ARN.");
      }
    } catch (error) {
      console.error("Error submitting Role ARN:", error);
      setResponseMessage("An error occurred while submitting the Role ARN.");
    } finally {
      setLoading(false); // Stop the loading state
    }
  };

  const handleSetUpAwsClick = () => {
    setShowInput(true);
  };

  const handleRoleArnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoleArn(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <main className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Set Up AWS Monitoring
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          Click the button below to set up AWS CloudFormation for setting up the
          required IAM role:
        </p>

        <a
          href="https://console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/new?stackName=OptiCloudMonitoringRole&templateURL=https://opticloud-role-template.s3.us-west-1.amazonaws.com/OptiCloud.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-blue-500 text-white font-semibold text-lg text-center py-3 rounded-lg hover:bg-blue-600 transition mb-6 shadow-sm"
        >
          Set Up CloudFormation Stack
        </a>

        <p className="mb-4 text-lg text-gray-700 font-medium">
          After clicking the link above, follow these steps to create the stack:
        </p>
        <ol className="list-decimal list-inside mb-6 pl-6 text-gray-600">
          <li className="mb-2">
            Click <strong>Next</strong> on the "Create Stack" page.
          </li>
          <li className="mb-2">
            Click <strong>Next</strong> on the "Configure Stack Options" page.
          </li>
          <li className="mb-2">
            Check the box to <strong>Acknowledge</strong> that AWS
            CloudFormation may create IAM resources.
          </li>
          <li className="mb-2">
            Click <strong>Create Stack</strong>.
          </li>
          <li className="mb-2">
            Wait for the stack creation process to complete (it may take a few
            minutes).
          </li>
        </ol>

        <p className="mb-6 text-lg text-gray-700 font-medium">
          Once the stack is created, you can copy the <strong>Role ARN</strong>{" "}
          from the output tab and paste it below.
        </p>

        {/* Button to show the input field */}
        <button
          onClick={handleSetUpAwsClick}
          className="w-full bg-green-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-green-600 transition mb-6 shadow-sm"
        >
          Click Here to set up AWS Monitoring
        </button>

        {/* Conditionally render the input field and submit button */}
        {showInput && (
          <div className="mt-4">
            <input
              type="text"
              value={roleArn}
              onChange={handleRoleArnChange}
              placeholder="Enter AWS Role ARN"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-600 transition shadow-sm"
            >
              Submit
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AwsSetup;
