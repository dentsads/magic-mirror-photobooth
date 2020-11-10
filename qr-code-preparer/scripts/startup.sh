#!/bin/bash

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DIR_ROOT="$(dirname "${THIS_DIR}")"

BASE_PATH="$HOME/.magic-mirror-photobooth"
EVENT_ID=$(jq -r .event_id $DIR_ROOT/config.json)
PHOTOS_PATH="$BASE_PATH/photos"
SCALED_PHOTOS_PATH="$PHOTOS_PATH/${EVENT_ID}_scaled"

if [ -z "$AWS_ACCESS_KEY" ]; then
    echo "You need to set the AWS_ACCESS_KEY environment variable for the AWS access token"
    exit 1
fi

if [ -z "$AWS_SECRET_KEY" ]; then
    echo "You need to set the AWS_SECRET_KEY environment variable for the AWS secret token"
    exit 1
fi

if ! which aws > /dev/null; then
   echo "aws cli was not found. Please install it from here: https://aws.amazon.com/cli/?nc1=h_ls"
   exit 1
fi

echo "login to AWS"
aws configure set default.region "eu-central-1"
aws configure set aws_access_key_id "$AWS_ACCESS_KEY"
aws configure set aws_secret_access_key "$AWS_SECRET_KEY"

inotifywait -m -e close_write --format '%f' "$PHOTOS_PATH/${EVENT_ID}" | while read file; do    
    PRESIGNED_URL=$(aws s3 presign s3://magic-mirror-photobooth-gallery/$EVENT_ID/pics/$file --expires-in 604800)
    echo '{"file": "'$file'", "file_uploaded": "false", "presigned_url": "'$PRESIGNED_URL'"}' > $SCALED_PHOTOS_PATH/presigned-urls.json
    bash $DIR_ROOT/scripts/resize-and-watermark-photo.sh "$PHOTOS_PATH/${EVENT_ID}/$file"
    bash $DIR_ROOT/scripts/upload-album-to-s3-gallery.sh $EVENT_ID $SCALED_PHOTOS_PATH

    upload_exit_status=$?
    if [ $upload_exit_status -eq 0 ]; then
        echo "upload to s3 was successful"
        FILE_CONTENT=$(cat $SCALED_PHOTOS_PATH/presigned-urls.json | jq --arg file_uploaded true '. + {file_uploaded: $file_uploaded}')
        echo $FILE_CONTENT > $SCALED_PHOTOS_PATH/presigned-urls.json
    fi
done