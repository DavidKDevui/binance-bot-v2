#!/bin/bash

# Variables
DOCKER_USERNAME="davidkdevui"
IMAGE_NAME="binance-bot"
VERSION="2.0.0"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
LATEST_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

# Login to Docker Hub
echo "Login to Docker Hub..."
docker login

# Build the image
echo "Building the image..."
docker build -t ${FULL_IMAGE_NAME} .

# Tag as latest
echo "Tagging image as latest..."
docker tag ${FULL_IMAGE_NAME} ${LATEST_IMAGE_NAME}

# Push both tags
echo "Pushing version tag..."
docker push ${FULL_IMAGE_NAME}

echo "Pushing latest tag..."
docker push ${LATEST_IMAGE_NAME}

echo "✅ Done! Images pushed:"
echo "- ${FULL_IMAGE_NAME}"
echo "- ${LATEST_IMAGE_NAME}"
