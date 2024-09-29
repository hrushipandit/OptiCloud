# views.py
from django.http import JsonResponse
from .mongodb import insert_data, get_data, insert_user_data
from django.views.decorators.csrf import csrf_exempt
import json
import boto3
from datetime import datetime, timedelta

def json_serializer(value):
    if isinstance(value, ObjectId):
        return str(value)
    return value


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

def insert_view(request):
    result = insert_data()
    return JsonResponse({'result': result})

def retrieve_view(request):
    data = get_data()
    return JsonResponse({'data': data})

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# csrf_exempt is used to disable CSRF checks (you should use this with caution)
@csrf_exempt
def receive_role_arn(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body
            body = json.loads(request.body)

            # Extract the 'roleArn' from the request body
            role_arn = body.get('roleArn')

            if not role_arn:
                return JsonResponse({'message': 'Role ARN not provided'}, status=400)

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



        
            



