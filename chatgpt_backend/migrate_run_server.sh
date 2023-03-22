#!/bin/bash

source .venv/bin/activate

export $(grep -v '^#' ../.envs/.env.dev | xargs)

python manage.py create_superuser

python manage.py makemigrations && python manage.py migrate && python manage.py collectstatic --noinput --clear --verbosity 0 && python manage.py runserver 0:8090
