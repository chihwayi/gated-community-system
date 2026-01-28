#!/bin/bash
set -e

echo "========================================"
echo "      Dual Push Publishing Script       "
echo "========================================"

# Ensure we are on main branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# 1. Push Full Code to Private Repo
echo "Step 1: Pushing full code to Private Repository (origin-private)..."
git push origin-private $CURRENT_BRANCH

# 2. Sanitize Codebase (Remove Super Admin Platform)
echo "Step 2: Sanitizing codebase for Public Repository..."

# Check if platform folder exists before trying to remove
if [ -d "web-portal/app/platform" ]; then
    echo "Removing web-portal/app/platform..."
    git rm -r web-portal/app/platform
    git commit -m "chore: remove private modules for public release"
else
    echo "Warning: web-portal/app/platform not found. Skipping removal."
fi

# 3. Push Sanitized Code to Public Repo
echo "Step 3: Pushing sanitized code to Public Repository (origin-public)..."
git push --force origin-public $CURRENT_BRANCH

# 4. Restore Codebase
echo "Step 4: Restoring codebase..."
# Undo the last commit and restore files
git reset --hard HEAD~1

echo "========================================"
echo "      Publishing Complete!              "
echo "========================================"
