#!/bin/bash

# Step 1: Save the last commit message to a variable
LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)

# Reset the last commit but keep the changes
git reset HEAD~1

# Step 2: Checkout pnpm-lock.yaml from the previous commit (undo changes to it)
git checkout pnpm-lock.yaml

# Step 3: Run pnpm install
pnpm i

# Step 4: Commit the changes with the previously saved commit message
git add .
git commit -m "$LAST_COMMIT_MESSAGE"
