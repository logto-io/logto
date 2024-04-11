TAG = local-logto:latest

build:
		docker build -t ${TAG} .
run:
		docker-compose -f docker-compose-local.yml up --detach

