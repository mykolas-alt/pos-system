#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found! Exiting."
    exit 1
fi

# PostgreSQL configuration
POSTGRES_DB=posdb
DB_PORT=5432
CONTAINER_NAME=pos-postgres
POSTGRES_VERSION=16

# Function to start the container
start_db() {
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        echo "Container $CONTAINER_NAME already exists. Starting it..."
        docker start $CONTAINER_NAME
    else
        echo "Running new PostgreSQL container $CONTAINER_NAME..."
        docker run -d \
            --name $CONTAINER_NAME \
            -e POSTGRES_DB=$POSTGRES_DB \
            -e POSTGRES_USER=$POSTGRES_USER \
            -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
            -p $DB_PORT:5432 \
            -v pgdata:/var/lib/postgresql/data \
            postgres:$POSTGRES_VERSION
    fi
    echo "PostgreSQL is running on port $DB_PORT"
}

# Function to stop the container
stop_db() {
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo "Stopping container $CONTAINER_NAME..."
        docker stop $CONTAINER_NAME
    else
        echo "Container $CONTAINER_NAME is not running."
    fi
}

# Parse command-line arguments
case "$1" in
--startdb)
    start_db
    ;;
--stopdb)
    stop_db
    ;;
*)
    echo "Usage: $0 --startdb | --stopdb"
    exit 1
    ;;
esac
