import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";

const AwsSetup: React.FC = () => {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false); // State to show/hide the input field
  const [roleArn, setRoleArn] = useState(""); // State to store the role ARN entered by the user

  const handleSetUpAwsClick = () => {
    setShowInput(true); // Show the input field when the button is clicked
  };

  const handleRoleArnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoleArn(event.target.value); // Update role ARN state
  };

  const handleSubmit = () => {
    // Perform actions with the role ARN, like sending it to a backend or using it to configure AWS resources.
    console.log("Role ARN entered:", roleArn);
    // Add logic to handle the ARN as needed.
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
          and paste it below.
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
