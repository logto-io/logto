#!/bin/bash

if [ -z "$AWS_PROFILE" ]; then
    echo "AWS_PROFILE environment variable is not set. Exiting..."
    exit 1
fi

print_in_green() {
    GREEN='\033[0;32m'
    NC='\033[0m'
    echo -e "${GREEN}$1${NC}"
}

print_in_blue() {
    BLUE='\033[0;34m'
    NC='\033[0m'
    echo -e "${BLUE}$1${NC}"
}

print_in_red() {
    RED='\033[0;31m'
    NC='\033[0m'
    echo -e "${RED}$1${NC}"
}

DOCKER_COMPOSE_FILE=${1:-docker-compose-ogcio-logto.yml}

if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "Docker Compose file not found!"
  exit 1
fi

aws_ecr_login() {
    print_in_blue "Logging in to AWS ECR..."
    aws sso login --profile $AWS_PROFILE

    if [ $? -ne 0 ]; then
        print_in_red "AWS SSO login failed. Exiting..."
        exit 1
    fi

    aws ecr get-login-password --region eu-west-1 --profile $AWS_PROFILE | docker login --username AWS --password-stdin 730335224023.dkr.ecr.eu-west-1.amazonaws.com

    if [ $? -ne 0 ]; then
        print_in_red "Docker login to ECR failed. Exiting..."
        exit 1
    fi
}

create_docker_network() {
    NETWORK_NAME="logto_network"
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        print_in_blue "Creating Docker network '$NETWORK_NAME'..."
        docker network create $NETWORK_NAME
        if [ $? -ne 0 ]; then
            print_in_red "Failed to create Docker network '$NETWORK_NAME'. Exiting..."
            exit 1
        fi
    else
        print_in_blue "Docker network '$NETWORK_NAME' already exists."
    fi
}

docker-compose -f "$DOCKER_COMPOSE_FILE" down

create_docker_network

docker-compose -f "$DOCKER_COMPOSE_FILE" up --detach
if [ $? -ne 0 ]; then
    print_in_blue "docker-compose up failed. Trying to log in to AWS ECR..."
    aws_ecr_login
    print_in_blue "Retrying docker-compose up..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up --detach
    if [ $? -ne 0 ]; then
        print_in_red "docker-compose up failed again. Exiting..."
        exit 1
    fi
fi

print_in_green "docker-compose up succeeded."
