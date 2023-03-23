#!/bin/bash

set -e

echo "⚡ Installing ChatGPT-clone... ⚡"

echo "🔍 Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker not found. Please install Docker and try again."
  exit 1
fi
echo "✅ Docker found."

# Check if Docker Compose is installed
if ! command -v docker-compose >/dev/null 2>&1 && ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "❌ Docker Compose not found. Please install Docker Compose and try again."
  exit 1
fi
echo "✅ Docker Compose found."

echo "🚀 Starting installation of ChatGPT-clone..."

REPO_DIR="$HOME/chatgpt-clone"

# Check if repository already exists
if [ -d "$REPO_DIR" ]; then
  echo "🔄 Repository already exists at $REPO_DIR - Attempting to update..."
  cd "$REPO_DIR"
  git pull >/dev/null 2>&1

  # Check for errors during pull
  if [ $? -ne 0 ]; then
    read -p "⚠️ Error updating repository. Clean and update? [Y/n]: " answer
    answer=${answer:-Y}
    if [[ $answer =~ ^[Yy]$ ]]; then
      git reset --hard >/dev/null 2>&1
      git clean -fd >/dev/null 2>&1
      git pull >/dev/null 2>&1
    fi
  fi
else
  # Clone the repository
  echo "📦 Cloning repository to $REPO_DIR directory..."
  git clone https://github.com/fatihbaltaci/chatgpt-clone.git "$REPO_DIR" >/dev/null 2>&1
  cd "$REPO_DIR"
fi

# Update .env file
ENV_FILE=".envs/.env"

# Check if OPENAI_API_KEY is set
OPENAI_API_KEY_SET=false
if grep -q "OPENAI_API_KEY=" "$ENV_FILE"; then
  echo "📌 OPENAI_API_KEY is already set in the $ENV_FILE file: $(grep "OPENAI_API_KEY=" "$ENV_FILE" | cut -d '=' -f 2)"
  read -p "Do you want to update the OPENAI_API_KEY? [Y/n]: " update_answer
  update_answer=${update_answer:-Y}
  if [[ $update_answer =~ ^[Yy]$ ]]; then
    OPENAI_API_KEY_SET=true
  fi
fi

# Prompt user to input OpenAI API key if not set
if $OPENAI_API_KEY_SET; then
  read -p "🔑 Enter your OpenAI API Key: " OPENAI_API_KEY
  # Update .env file
  sed -i.bak "s/^OPENAI_API_KEY=.*$/OPENAI_API_KEY=${OPENAI_API_KEY}/" "$ENV_FILE" && rm "$ENV_FILE.bak"
fi

REACT_ENV_FILE=chatgpt_frontend/.env
REACT_APP_BACKEND_URL=$(grep "REACT_APP_BACKEND_URL=" "$REACT_ENV_FILE" | cut -d '=' -f 2)

# Ask the user if they want to change the backend URL
read -p "Do you want to change the Backend URL? Current Backend URL: $REACT_APP_BACKEND_URL [y/N]: " change_url
change_url=${change_url:-N}

if [[ $change_url =~ ^[Yy]$ ]]; then
  read -p "Enter the new Backend URL e.g https://chat.yourdomain.com/api: " new_url
  REACT_APP_BACKEND_URL="${new_url}"
  sed -i.bak "s|^REACT_APP_BACKEND_URL=.*$|REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}|" "$REACT_ENV_FILE" && rm "$REACT_ENV_FILE.bak"
  echo "🔧 Backend URL changed to $REACT_APP_BACKEND_URL"
fi

# Determine which compose command to use
COMPOSE_COMMAND="docker-compose"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_COMMAND="docker compose"
fi

# Build and run the project
echo "🛠 Building the project... (This may take up to 10 minutes based on your internet connection speed)"
$COMPOSE_COMMAND -f "$REPO_DIR/docker-compose.yml" build >/dev/null 2>&1
echo "🚀 Deploying ChatGPT-clone..."
$COMPOSE_COMMAND -f "$REPO_DIR/docker-compose.yml" up -d --build --force-recreate --remove-orphans
echo "✅ ChatGPT-clone installation complete! 🎉"
echo "📁 Installation directory: $REPO_DIR"

# Remove '/api' from the REACT_APP_BACKEND_URL
REACT_APP_BASE_URL="${REACT_APP_BACKEND_URL%/api}"

echo "🌐 Open $REACT_APP_BASE_URL in your browser to access the application."

# Open browser to access the project
if command -v open >/dev/null 2>&1; then
  open "$REACT_APP_BASE_URL" >/dev/null 2>&1
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$REACT_APP_BASE_URL" >/dev/null 2>&1
elif command -v gnome-open >/dev/null 2>&1; then
  gnome-open "$REACT_APP_BASE_URL" >/dev/null 2>&1
elif command -v kde-open >/dev/null 2>&1; then
  kde-open "$REACT_APP_BASE_URL" >/dev/null 2>&1
fi
