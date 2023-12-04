# /bin/bash

IMG=$( base64 ./1_img.png )

echo $IMG

echo { "img": "$IMG" } | curl -X POST -H "Content-Type: application/json" -d @- http://127.0.0.1:8000/api/predict/ 


# NOTE: Argument list too long
# curl --header "Content-Type: application/json" \
#  --request POST \
#  --data '{"img":"'"$( base64 ./1_img.png)"'","mask":"xyz"}' \
#  http://127.0.0.1:8000/api/predict/


