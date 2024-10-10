#!/bin/bash

# Navigate to the parent directory containing all project folders
# Replace '/path/to/parent/directory' with the actual path
cd /path/to/parent/directory

# Main  package.json
    echo "Running npm install in the main directory"
    npm install

# Loop through all subdirectories
for dir in */; do
    if [ -d "$dir" ]; then
        echo "Entering $dir"
        cd "$dir"

        # Check if package.json exists in the directory
        if [ -f "package.json" ]; then
            echo "Running npm install in $dir"
            npm install
        else
            echo "No package.json found in $dir, skipping..."
        fi

        cd ..
    fi
done

echo "All npm installs completed!"