# views.py
from django.http import JsonResponse
from .mongodb import insert_data, get_data

def insert_view(request):
    result = insert_data()
    return JsonResponse({'result': result})

def retrieve_view(request):
    data = get_data()
    return JsonResponse({'data': data})

