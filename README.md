# Cloud Resource Optimization Platform

## Overview
This Cloud Resource Optimization Platform is designed to enhance the efficiency of AWS EC2 instances. Utilizing a robust backend built with Django and a responsive frontend developed with Next.js, the platform leverages LLM integration to analyze AWS CloudWatch metrics. Our goal is to deliver actionable recommendations that improve resource utilization and optimize cloud infrastructure.

## Key Features
- **Dynamic Data Extraction**: Extracts AWS CloudWatch metrics to analyze the performance and health of EC2 instances.
- **Automated Recommendations**: Utilizes advanced LLM integration to generate tailored recommendations for reducing resource usage and improving efficiency.
- **Role Automation**: Employs the boto3 AWS SDK and CloudFormation API for automating AWS role creation and resource provisioning via YAML files.
- **Secure Authentication**: Implements Google OAuth for secure and reliable user authentication.

## Technologies Used
- **Backend**: Django
- **Frontend**: Next.js
- **UI Design**: React and Tailwind CSS for a responsive and modern user interface
- **AWS Integration**: Boto3 AWS SDK, CloudFormation
- **LLM Integration**: Utilizes advanced machine learning models to process and analyze data

## Getting Started
To get started with this project, follow the steps below:
1. **Clone the repository:**
2. ```
   git clone https://github.com/yourusername/cloud-resource-optimization.git
 '''
 3. **Install dependencies:**
Navigate to the project directory and install the required dependencies:
```
   pip install -r requirements.txt
   cd frontend && npm install
```

Configure your AWS credentials: Ensure your AWS credentials are configured correctly by setting up the AWS CLI or exporting your credentials in your environment variables.

Start the development servers:

```
# Start the Django backend server
python manage.py runserver
# In a new terminal, start the Next.js frontend
cd frontend && npm run dev
```

Contributing
Contributions to improve the platform are welcome. Please feel free to fork the repository, make changes, and submit a pull request. You can also open issues for bugs or feature requests.

License
This project is licensed under the MIT License - see the LICENSE.md file for details.

Contributing
Contributions to improve the platform are welcome. Please feel free to fork the repository, make changes, and submit a pull request. You can also open issues for bugs or feature requests.

License
This project is licensed under the MIT License - see the LICENSE.md file for details.

