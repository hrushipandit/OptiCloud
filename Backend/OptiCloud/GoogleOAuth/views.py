# views.py
from django.http import JsonResponse
from .mongodb import insert_user_data
from django.views.decorators.csrf import csrf_exempt
import json
import boto3
from datetime import datetime, timedelta
from .mongodb import get_database
from bson import ObjectId  # For handling MongoDB ObjectId


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

            if user_updated:
                # Send a success response back to the client
                return JsonResponse({'message': 'Role ARN updated successfully'})

            # Perform any logic with the role ARN (save it, process it, etc.)
            print(f"Received Role ARN: {role_arn}")

            customer_credentials = assume_customer_role(role_arn)

            if customer_credentials:
                # Step 3: Use the customer's credentials to interact with EC2 and CloudWatch
                get_ec2_metrics_for_all_instances(customer_credentials)
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

    for instance_id in instance_ids:
        try:
            response = cloudwatch_client.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[
                    {
                        'Name': 'InstanceId',
                        'Value': instance_id
                    }
                ],
                StartTime=start_time.isoformat(),
                EndTime=end_time.isoformat(),
                Period=3600,
                Statistics=['Average']
            )

            print(f"Metrics for EC2 instance {instance_id}:")
            if response['Datapoints']:
                for datapoint in response['Datapoints']:
                    print(f"Time: {datapoint['Timestamp']}, Avg CPU: {datapoint['Average']}")
            else:
                print(f"No metrics found for instance {instance_id}")

        except boto3.exceptions.Boto3Error as e:
            print(f"Failed to fetch metrics for instance {instance_id}: {e}")



        
            



