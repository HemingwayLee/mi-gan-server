import os
import json
import base64
import string
import random
from PIL import Image, ImageOps, ImageDraw
from io import BytesIO
from django.http import JsonResponse
from django.db import connection 
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from .demo import main

def _remove_transparency(im, bg_colour=(255, 255, 255)):

    # Only process if image has transparency (http://stackoverflow.com/a/1963146)
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):

        # Need to convert to RGBA if LA format due to a bug in PIL (http://stackoverflow.com/a/1963146)
        alpha = im.convert('RGBA').split()[-1]

        # Create a new background image of our matt color.
        # Must be RGBA because paste requires both images have the same format
        # (http://stackoverflow.com/a/8720632  and  http://stackoverflow.com/a/9459208)
        bg = Image.new("RGBA", im.size, bg_colour + (255,))
        bg.paste(im, mask=alpha)
        return bg

    else:
        return im


@require_http_methods(["GET"])
def list_images(request):
    files = []
    for filename in os.listdir(f"{settings.MEDIA_ROOT}/places2_512_object/images"):
        if filename.endswith(".png"):
            files.append(filename)

    return JsonResponse({"images": files})


@csrf_exempt
@require_http_methods(["POST"])
def predict(request):
    body = json.loads(request.body)
    # print(body["filename"])
    # print(body["mask"])

    # with open(f"{settings.MEDIA_ROOT}/tmpMask.png", "wb") as fh:
    #     fh.write(base64.decodebytes(bytes(body["mask"], "utf-8")))
    
    im = Image.open(BytesIO(base64.b64decode(bytes(body["mask"], "utf-8"))))
    im = _remove_transparency(im)
    im = im.convert("RGB")
    im.save(f"{settings.MEDIA_ROOT}/tmpMask.png")

    main(
        model_name='migan-256', 
        model_path=f"{settings.MEDIA_ROOT}/models/migan_256_places2.pt", 
        img_path=f"{settings.MEDIA_ROOT}/places2_512_object/images/{body['filename']}",
        mask_path=f"{settings.MEDIA_ROOT}/tmpMask.png",
        output_path=f"{settings.MEDIA_ROOT}",
        invert=False,
    )

    # Note: Testing
    # main(
    #     model_name='migan-256', 
    #     model_path=f"{settings.MEDIA_ROOT}/models/migan_256_places2.pt", 
    #     img_path=f"{settings.MEDIA_ROOT}/places2_512_object/images/2.png",
    #     mask_path=f"{settings.MEDIA_ROOT}/places2_512_object/masks/2.png",
    #     output_path=f"{settings.MEDIA_ROOT}",
    #     invert=True,
    # )

    return JsonResponse({"result": "updated!"})


@csrf_exempt
@require_http_methods(["POST"])
def predict_image(request):
    body = json.loads(request.body)
    
    # with open(f"{settings.MEDIA_ROOT}/tmpMask.png", "wb") as fh:
    #     fh.write(base64.decodebytes(bytes(body["mask"], "utf-8")))
    
    base64_image_data = body.get("image")
    format, imgstr = base64_image_data.split(';base64,')
    ext = format.split('/')[-1]
    decoded_file = base64.b64decode(imgstr)
    fn = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    file_path = f"{settings.MEDIA_ROOT}/places2_512_object/images/{fn}.{ext}"
    with open(file_path, "wb") as f:
        f.write(decoded_file)

    bboxes_data = body.get("bboxes")
    im = Image.open(file_path).convert("RGB")
    w, h = im.size
    mask = Image.new('RGB', (w, h), color=(255, 255, 255))
    print(f"bboxes: {bboxes_data}, h: {h}, w: {w}")

    draw = ImageDraw.Draw(mask)
    for bbox in bboxes_data:
        draw.rectangle((bbox[0], bbox[1], bbox[2], bbox[3]), fill=(0,0,0))
        

    mask_path = f"{settings.MEDIA_ROOT}/myMask.png"
    mask.save(mask_path)
    output_filepath, composed_img = main(
        model_name='migan-256', 
        model_path=f"{settings.MEDIA_ROOT}/models/migan_256_places2.pt", 
        img_path=file_path,
        mask_path=mask_path,
        output_path=f"{settings.MEDIA_ROOT}",
        invert=False,
    )

    output_buffer = BytesIO()
    composed_img.save(output_buffer, format='PNG')
    byte_data = output_buffer.getvalue()
    encoded_string = base64.b64decode(byte_data, "utf-8")
    base64_final_image = f"data:image/png;base64,{encoded_string}"

    return JsonResponse({
        "image_base64": base64_final_image,
        "image_path": output_filepath
    })


@csrf_exempt
@require_http_methods(["POST"])
def cleanup_results(request):
    dir_name = f"{settings.MEDIA_ROOT}"
    for item in os.listdir(dir_name):
        if item.endswith(".png"):
            os.remove(os.path.join(dir_name, item))

    return JsonResponse({"result": "removed"})


@csrf_exempt
@require_http_methods(["POST"])
def do_upload(request):
    uploadedFile = request.FILES['myfile'] if 'myfile' in request.FILES else False
    if uploadedFile:
        upload_dir = f"{settings.MEDIA_ROOT}/places2_512_object/images"
        fss = FileSystemStorage(location=upload_dir)
        filename = fss.save(uploadedFile.name, uploadedFile)
        return JsonResponse({'filename': filename})
    else:
        return JsonResponse({'filename': None, 'status': None }, status=400)


@require_http_methods(["GET"])
def hello(request):
    return JsonResponse({"hello": "hi"})
