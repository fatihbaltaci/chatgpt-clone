#!/bin/bash

source .venv/bin/activate

export $(grep -v '^#' ../.envs/.env.dev | xargs)

python manage.py shell_plus

