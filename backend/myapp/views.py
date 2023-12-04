import os
import json
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
    

@require_http_methods(["GET"])
def list_images(request):
    files = []
    for filename in os.listdir(f"{settings.MEDIA_ROOT}/places2_512_object/images"):
        if filename.endswith(".png"):
            files.append(filename)

    return JsonResponse({"images": files})


@require_http_methods(["POST"])
def predict(request):
    body = json.loads(request.body)
    print(body["img"])
    print(body["mask"])
    
    return JsonResponse({"result": "updated!"})
