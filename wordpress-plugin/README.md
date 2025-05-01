# UC Calculator WordPress Plugin

## Installation Instructions

Due to the complexity of the React application, the standard build process in Replit may time out. Follow these alternative steps to complete the installation:

### Step 1: Download the WordPress Plugin Structure

1. Download the `uc-calculator.zip` file from this Replit project 
2. Unzip the file on your local computer to get the `uc-calculator` folder

### Step 2: Add the React Build Files

To complete the plugin with proper JavaScript functionality, you need to:

1. Clone the GitHub repo: https://github.com/AmeyaMitragotri/StudentSuccessHub
2. Run the build process locally:
   ```bash
   npm install
   npm run build
   ```
3. Copy the built files:
   - Copy all `.js` files from the `dist/assets` folder to your plugin's `uc-calculator/assets/js` folder
   - Copy all `.css` files from the `dist/assets` folder to your plugin's `uc-calculator/assets/css` folder

### Step 3: Install on WordPress

1. Zip the completed `uc-calculator` folder
2. Upload and install the plugin on your WordPress site at scorecalc.net
3. Use the provided shortcodes to embed calculators on your pages

## Available Shortcodes

- `[uc_calculator]` - All calculators with tabs
- `[uc_gpa_calculator]` - UC GPA Calculator only
- `[final_grade_calculator]` - Final Grade Calculator only
- `[sat_act_converter]` - SAT/ACT Converter only
- `[uc_chancing_calculator]` - UC Chances Calculator only
- `[service_tracker]` - Service Hours Tracker only