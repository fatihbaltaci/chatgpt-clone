#!/bin/bash

export $(grep -v '^#' ../.envs/.env.dev | xargs)

python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0:8090
