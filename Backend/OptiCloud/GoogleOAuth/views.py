# views.py
from django.http import JsonResponse
from .mongodb import insert_user_data
from django.views.decorators.csrf import csrf_exempt
import json
import boto3
from datetime import datetime, timedelta
from .mongodb import get_database
from bson import ObjectId  # For handling MongoDB ObjectId
import requests
from django.views.decorators.http import require_http_methods
import os
import openai



@csrf_exempt
def get_user_role_arn(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body from the request
            body = json.loads(request.body)
            user_id = body.get('user_id')  # Extract the user_id from the request

            if not user_id:
                return JsonResponse({'message': 'User ID not provided'}, status=400)

            # Access the MongoDB database and collection
            db = get_database()
            collection = db['test_collection']  # Your MongoDB collection

            # Find the user by their 'id' field (not '_id')
            user = collection.find_one({"id": user_id})


            if user and 'roleArn' in user:
                # Return the roleArn if found
                customer_credentials = assume_customer_role(user['roleArn'])
                ec2_metrics = get_ec2_metrics_for_all_instances(customer_credentials)
                        # Update the user's roleArn
                print("Done")
                collection.update_one({"id": user_id}, {"$set": {"aws_metrics": ec2_metrics}})
                return JsonResponse({'roleArn': user['roleArn']}, status=200)
            else:
                # User or roleArn not found
                return JsonResponse({'message': 'User or Role ARN not found'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"Error fetching Role ARN: {e}")
            return JsonResponse({'message': 'Internal server error', 'error': str(e)}, status=500)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

@csrf_exempt
def get_user_metrics(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body from the request
            print ("the request is",request)
            body = json.loads(request.body)
            user_id = body.get('user_id')  # Extract the user_id from the request

            if not user_id:
                return JsonResponse({'message': 'User ID not provided'}, status=400)

            # Access the MongoDB database and collection
            db = get_database()
            collection = db['test_collection']  # Your MongoDB collection

            # Find the user by their 'id' field (not '_id')
            user = collection.find_one({"id": user_id})


            if user and 'aws_metrics' in user:
                # Return the metrics if found
                try:
                    aws_metrics = json.loads(user['aws_metrics'])  # Assuming it's stored as a string
                except (TypeError, json.JSONDecodeError):
                    # If aws_metrics is already a dictionary, no need to parse
                    aws_metrics = user['aws_metrics']
                return JsonResponse({'aws_metrics': aws_metrics}, status=200)
            else:
                # User or roleArn not found
                return JsonResponse({'message': 'User or Metrics not found'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"Error fetching Role ARN: {e}")
            return JsonResponse({'message': 'Internal server error', 'error': str(e)}, status=500)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

# update roleArn for a user
def update_user_role_arn(user_id, role_arn):
    db = get_database()
    collection = db['test_collection']  # Your MongoDB collection for users

    try:
        # Example: If you're using MongoDB and the user collection
        # Assuming you have a MongoDB collection called 'users'
        user = collection.find_one({"id": user_id})  # Use user_id as a string directly

        if user:
            # Update the user's roleArn
            collection.update_one({"id": user_id}, {"$set": {"roleArn": role_arn}})
            return True
        return False

    except Exception as e:
        print(f"Error updating user role ARN: {e}")
        return False

@csrf_exempt
def generate_text_from_gpt(final_output):
    try:
        # Parse the JSON data from request.body
        print("final output is ",final_output)
        # Prepare the prompt
        prompt = r"""You are an AWS optimization and sustainability expert. Given the following CloudWatch metrics for an EC2 instance, provide specific recommendations to optimize resource usage and reduce the carbon footprint. The recommendations should target improvements in CPU, network usage, disk I/O, and overall health checks of the instance.

For each metric, analyze the provided data and offer actionable steps to minimize resource consumption, identify idle resources, and suggest cost-efficient scaling or resizing. Also, recommend any AWS-specific features, such as auto-scaling, instance scheduling, or using more efficient instance types. Make your suggestions clear, concise, and focused on reducing carbon emissions and optimizing energy usage. Please keep the current usage and optimized usage to a single number since it will be visualized. the recommendation has to be one line strictly

In addition, provide suggestions for what should be done for each metric and ensure that your output includes a very specific numeric metric summary that will be consistent each time so that they can be easily parsed. Follow the exact structure and format outlined below but the return file should be in JSON format with Current_Usage:  and Optimized_Usage: being strictly numbers and only numbers

{final_output}
Provide your response in the following specific format:
{
  'Optimization_Recommendations': {
    'CPU_Utilization': {
      'Recommendation': 'The average CPU usage is very low at 1.64%. Consider switching to a t3.micro instance or enabling auto-scaling to adapt to demand fluctuations.',
      'Current_Usage': 1.64,
      'Optimized_Usage': 0.5
    },
    'Disk_IO': {
      'Recommendation': 'No disk operations detected. Review and detach unused EBS volumes to reduce costs and energy consumption.',
      'Current_Usage': 0,
      'Optimized_Usage': 0
    },
    'Network_Usage': {
      'Recommendation': 'Network traffic shows consistent usage at 300 bytes per second on average. Implement VPC Endpoints and review data transfer to minimize unnecessary traffic.',
      'Current_Usage': 300,
      'Optimized_Usage': 150
    },
    'Instance_Health': {
      'Recommendation': 'All health checks are passing. Implement instance scheduling to shut down the instance during non-peak hours to save energy.',
      'Current_Usage': 100,
      'Optimized_Usage': 50
    }
  },
  'Carbon_Footprint_Reduction': {
    'Reduction_Percentage': 30
  }
}"""

        # API URL and key
        api_url = "https://api.openai.com/v1/engines/davinci-codex/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
        }

        # Sending POST request to GPT-3.5

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": f"{prompt}"}
            ],
            max_tokens=4096,
            temperature=0.5,
        )
        refined_text = response.choices[0].message.content
        print(refined_text)
        return refined_text
    except Exception as e:
        print(e)
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
def user_data_view(request):
    if request.method == 'OPTIONS':
        return JsonResponse({'status': 'OK'})  # Respond OK to OPTIONS requests
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_data = data.get('user', {})
            user_id = insert_user_data(user_data)
            # Convert ObjectId to string
            user_data['_id'] = str(user_id)
            return JsonResponse({'status': 'Success', 'data': user_data})
        except Exception as e:
            print(e)
            return JsonResponse({'status': 'Error', 'message': str(e)}, status=400)
    else:
        return JsonResponse({'status': 'Error', 'message': 'Method not allowed'}, status=405)

# def insert_view(request):
#     result = insert_data()
#     return JsonResponse({'result': result})

# def retrieve_view(request):
#     data = get_data()
#     return JsonResponse({'data': data})



# csrf_exempt is used to disable CSRF checks (you should use this with caution)
@csrf_exempt
def receive_role_arn(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body
            body = json.loads(request.body)

            # Extract the 'roleArn' and 'user' from the request body
            role_arn = body.get('roleArn')
            user = body.get('user', {})
            user_id = user.get('id')  # Fetch 'id' from 'user'

            if not role_arn or not user_id:
                return JsonResponse({'message': 'Role ARN or user not provided'}, status=400)

            user_updated = update_user_role_arn(user_id, role_arn)


            # Perform any logic with the role ARN (save it, process it, etc.)
            print(f"Received Role ARN: {role_arn}")

            customer_credentials = assume_customer_role(role_arn)
            print("CC: ", customer_credentials)
            if customer_credentials:
                # Step 3: Use the customer's credentials to interact with EC2 and CloudWatch
                ec2_metrics = get_ec2_metrics_for_all_instances(customer_credentials)
                db = get_database()
                print(db)
                print(user_id)
                collection = db['test_collection']
                print(collection)
                try:
                    user = collection.find_one({"id": str(user_id)})
                    print(user)
                    collection.update_one({"id": user_id}, {"$set": {"aws_metrics": ec2_metrics}})
                except e:
                    print(e)
                
            else:
                print("Could not assume role, please check the role ARN and permissions.")

            # Send a success response back to the client
            return JsonResponse({'message': 'Role ARN received successfully'})

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

# Function to assume the customer's IAM role and get temporary credentials
def assume_customer_role(customer_role_arn):
    sts_client = boto3.client('sts')  # Using OptiCloud's AWS credentials
    try:
        assumed_role = sts_client.assume_role(
            RoleArn=customer_role_arn,  # Customer-provided role ARN
            RoleSessionName="OptiCloudSession"
        )
        # Extract the temporary credentials from the response
        credentials = assumed_role['Credentials']
        return {
            'access_key': credentials['AccessKeyId'],
            'secret_key': credentials['SecretAccessKey'],
            'session_token': credentials['SessionToken']
        }
    except boto3.exceptions.Boto3Error as e:
        print(f"Failed to assume role: {e}")
        return None

# Function to create an AWS client using the customer's temporary credentials
def create_customer_client(service_name, customer_credentials):
    return boto3.client(
        service_name,
        aws_access_key_id=customer_credentials['access_key'],
        aws_secret_access_key=customer_credentials['secret_key'],
        aws_session_token=customer_credentials['session_token']
    )

def get_ec2_instance_ids(customer_credentials):
    ec2_client = create_customer_client('ec2', customer_credentials)

    try:
        response = ec2_client.describe_instances()
        instance_ids = []
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                instance_ids.append(instance['InstanceId'])
        return instance_ids
    except boto3.exceptions.Boto3Error as e:
        print(f"Failed to fetch EC2 instances: {e}")
        return []

# Use the instance IDs to get CloudWatch metrics
def get_ec2_metrics_for_all_instances(customer_credentials):
    instance_ids = get_ec2_instance_ids(customer_credentials)
    
    if not instance_ids:
        print("No EC2 instances found.")
        return
    
    cloudwatch_client = create_customer_client('cloudwatch', customer_credentials)

    # Define start and end times dynamically in UTC
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=1)  # 24 hours before end time

    # List of metrics to retrieve
    metrics_to_fetch = [
        'CPUUtilization',
        'DiskReadOps',
        'DiskWriteOps',
        'DiskReadBytes',
        'DiskWriteBytes',
        'NetworkIn',
        'NetworkOut',
        'StatusCheckFailed',
        'StatusCheckFailed_Instance',
        'StatusCheckFailed_System'
    ]

    # Initialize a list to collect all the output strings
    output = []

    for instance_id in instance_ids:
        instance_output = f"Metrics for EC2 instance {instance_id}:\n"
        
        for metric_name in metrics_to_fetch:
            try:
                response = cloudwatch_client.get_metric_statistics(
                    Namespace='AWS/EC2',
                    MetricName=metric_name,
                    Dimensions=[
                        {
                            'Name': 'InstanceId',
                            'Value': instance_id
                        }
                    ],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=3600,
                    Statistics=['Average', 'Minimum', 'Maximum', 'Sum', 'SampleCount']
                )

                # If there are data points, add them to the output
                if response['Datapoints']:
                    instance_output += f"\nMetric: {metric_name}\n"
                    for datapoint in sorted(response['Datapoints'], key=lambda x: x['Timestamp']):
                        instance_output += (
                            f"Time: {datapoint['Timestamp']}, "
                            f"Avg: {datapoint.get('Average', 'N/A')}, "
                            f"Min: {datapoint.get('Minimum', 'N/A')}, "
                            f"Max: {datapoint.get('Maximum', 'N/A')}, "
                            f"Sum: {datapoint.get('Sum', 'N/A')}, "
                            f"SampleCount: {datapoint.get('SampleCount', 'N/A')}\n"
                        )
                else:
                    instance_output += f"No data found for metric: {metric_name}\n"

            except boto3.exceptions.Boto3Error as e:
                instance_output += f"Failed to fetch metric {metric_name} for instance {instance_id}: {e}\n"

        # Add the instance's metrics to the output list
        output.append(instance_output)

    # Combine all collected output into a single string
    final_output = "\n".join(output)
    print(final_output)
    response = generate_text_from_gpt(final_output)
    return response

@csrf_exempt
def get_cloudwatch_metrics(request):
    if request.method == 'POST':
        # Assuming you get customer credentials in the request
        roleArn = json.loads(request.body).get('roleArn')

        if roleArn:
            # Fetch metrics
            customer_credentials = assume_customer_role(roleArn)
            metrics_data = get_ec2_metrics_for_all_instances(customer_credentials)

            # Return the metrics data as JSON
            return JsonResponse(metrics_data, safe=False)
        else:
            return JsonResponse({"error": "No credentials provided"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)
