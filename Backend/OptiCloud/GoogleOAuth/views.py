# views.py
from django.http import JsonResponse
from .mongodb import insert_data, get_data, insert_user_data
from django.views.decorators.csrf import csrf_exempt
import json

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

