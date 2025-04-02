#!/bin/bash

echo "Starting Epic Quest RPG homepage on a local server..."

if command -v python3 &>/dev/null; then
    echo "Using Python 3 to start server..."
    python3 -m http.server 8000
elif command -v python &>/dev/null; then
    # Check Python version
    version=$(python -c 'import sys; print(sys.version_info[0])')
    if [ "$version" -eq 3 ]; then
        echo "Using Python 3 to start server..."
        python -m http.server 8000
    else
        echo "Using Python 2 to start server..."
        python -m SimpleHTTPServer 8000
    fi
else
    echo "Python not found. Please install Python or use another local server."
    exit 1
fi

echo "Server started! Open your browser and navigate to: http://localhost:8000" 