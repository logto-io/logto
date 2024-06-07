# This file has been added on OGCIO fork
TAG = local-logto:latest

build:
		docker build -t ${TAG} .
run:
		docker-compose -f docker-compose-local.yml up --detach

down:
		docker-compose -f docker-compose-local.yml down 