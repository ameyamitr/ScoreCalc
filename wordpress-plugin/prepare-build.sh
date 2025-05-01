#!/bin/bash

# This script prepares the React app build files for WordPress integration

# Step 1: Build the React app
echo "Building React app..."
# Temporarily modify the main entry point to use our WordPress version
cp client/src/main.tsx client/src/main.tsx.backup
cp client/src/wordpress-build.ts client/src/main.tsx
# Run the build
npm run build
# Restore the original main file
mv client/src/main.tsx.backup client/src/main.tsx

# Step 2: Create directories for WordPress plugin assets
mkdir -p wordpress-plugin/uc-calculator/assets/css
mkdir -p wordpress-plugin/uc-calculator/assets/js
mkdir -p wordpress-plugin/uc-calculator/assets/images

# Step 3: Copy CSS files
echo "Copying CSS files..."
cp dist/public/assets/*.css wordpress-plugin/uc-calculator/assets/css/main.css
# Append WordPress-specific CSS
cat wordpress-plugin/uc-calculator/assets/css/wp-integration.css >> wordpress-plugin/uc-calculator/assets/css/main.css

# Step 4: Copy JS files
echo "Copying JS files..."
cp dist/public/assets/*.js wordpress-plugin/uc-calculator/assets/js/main.js

# Step 5: Copy image files (if any)
echo "Copying image files..."
cp -r dist/public/assets/*.png dist/public/assets/*.jpg dist/public/assets/*.svg wordpress-plugin/uc-calculator/assets/images/ 2>/dev/null || :

# Step 6: Create ZIP archive
echo "Creating ZIP archive..."
cd wordpress-plugin
zip -r uc-calculator.zip uc-calculator

echo "Done! WordPress plugin is ready in wordpress-plugin/uc-calculator.zip"