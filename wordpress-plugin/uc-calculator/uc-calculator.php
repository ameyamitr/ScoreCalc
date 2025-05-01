<?php
/**
 * Plugin Name: UC Calculator Suite
 * Description: Interactive calculators for UC GPA, final grades, SAT/ACT conversion, UC chancing, and service hours tracking
 * Version: 1.0.0
 * Author: ScoreCalc
 * Text Domain: uc-calculator
 */

// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Define plugin constants
define('UC_CALC_VERSION', '1.0.0');
define('UC_CALC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UC_CALC_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once UC_CALC_PLUGIN_DIR . 'includes/shortcodes.php';
require_once UC_CALC_PLUGIN_DIR . 'includes/api.php';

// Register activation hook
register_activation_hook(__FILE__, 'uc_calculator_activate');

function uc_calculator_activate() {
    // Activation code here (if needed)
    flush_rewrite_rules();
}

// Register deactivation hook
register_deactivation_hook(__FILE__, 'uc_calculator_deactivate');

function uc_calculator_deactivate() {
    // Deactivation code here (if needed)
    flush_rewrite_rules();
}

// Enqueue scripts and styles
function uc_calculator_enqueue_scripts() {
    // Only load on pages that have our shortcode
    global $post;
    if (is_a($post, 'WP_Post') && 
        (has_shortcode($post->post_content, 'uc_calculator') ||
         has_shortcode($post->post_content, 'uc_gpa_calculator') ||
         has_shortcode($post->post_content, 'final_grade_calculator') ||
         has_shortcode($post->post_content, 'sat_act_converter') ||
         has_shortcode($post->post_content, 'uc_chancing_calculator') ||
         has_shortcode($post->post_content, 'service_tracker'))
       ) {
        
        // Add Tailwind styles
        wp_enqueue_style('uc-calculator-styles', UC_CALC_PLUGIN_URL . 'assets/css/main.css', array(), UC_CALC_VERSION);
        
        // Add calculator JS - use wp-integration.js as fallback until full build is added
        if (file_exists(UC_CALC_PLUGIN_DIR . 'assets/js/main.js')) {
            wp_enqueue_script('uc-calculator-js', UC_CALC_PLUGIN_URL . 'assets/js/main.js', array(), UC_CALC_VERSION, true);
        } else {
            wp_enqueue_script('uc-calculator-js', UC_CALC_PLUGIN_URL . 'assets/js/wp-integration.js', array(), UC_CALC_VERSION, true);
        }
        
        // Localize script to pass WordPress-specific data to JS
        wp_localize_script('uc-calculator-js', 'ucCalcSettings', array(
            'apiUrl' => rest_url('uc-calculator/v1/'),
            'nonce' => wp_create_nonce('wp_rest')
        ));
        
        // Add custom styles for WordPress integration
        wp_add_inline_style('uc-calculator-styles', '
            .calculator-container {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .calculator-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 10px;
            }
            
            .tab-button {
                padding: 8px 16px;
                background-color: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .tab-button.active {
                background-color: #71c1e9;
                color: white;
                border-color: #71c1e9;
            }
            
            .tab-button:hover:not(.active) {
                background-color: #e2e8f0;
            }
            
            .calculator-content {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                padding: 20px;
            }
            
            @media (max-width: 768px) {
                .calculator-tabs {
                    flex-direction: column;
                }
                
                .tab-button {
                    width: 100%;
                    text-align: center;
                }
            }
        ');
    }
}
add_action('wp_enqueue_scripts', 'uc_calculator_enqueue_scripts');

// Add admin menu
function uc_calculator_admin_menu() {
    add_menu_page(
        'UC Calculator Settings',
        'UC Calculators',
        'manage_options',
        'uc_calculator_settings',
        'uc_calculator_settings_page',
        'dashicons-calculator',
        30
    );
}
add_action('admin_menu', 'uc_calculator_admin_menu');

// Admin settings page
function uc_calculator_settings_page() {
    ?>
    <div class="wrap">
        <h1>UC Calculator Settings</h1>
        <div class="card">
            <h2>Available Calculators</h2>
            <p>Use these shortcodes to add calculators to your pages:</p>
            <ul>
                <li><code>[uc_calculator]</code> - All calculators with tabs</li>
                <li><code>[uc_gpa_calculator]</code> - UC GPA Calculator only</li>
                <li><code>[final_grade_calculator]</code> - Final Grade Calculator only</li>
                <li><code>[sat_act_converter]</code> - SAT/ACT Converter only</li>
                <li><code>[uc_chancing_calculator]</code> - UC Chances Calculator only</li>
                <li><code>[service_tracker]</code> - Service Hours Tracker only</li>
            </ul>
        </div>
    </div>
    <?php
}