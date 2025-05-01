<?php
// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Main calculator shortcode
function uc_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'calculator' => 'all', // Options: all, uc-gpa, final-grade, sat-act, uc-chance, service
    ), $atts);
    
    // Container div where React will mount
    return '<div id="uc-calculator-root" data-calculator="' . esc_attr($atts['calculator']) . '"></div>';
}
add_shortcode('uc_calculator', 'uc_calculator_shortcode');

// Individual calculator shortcodes
function uc_gpa_calculator_shortcode() {
    return '<div id="uc-gpa-calculator" class="uc-calculator-component"></div>';
}
add_shortcode('uc_gpa_calculator', 'uc_gpa_calculator_shortcode');

function final_grade_calculator_shortcode() {
    return '<div id="final-grade-calculator" class="uc-calculator-component"></div>';
}
add_shortcode('final_grade_calculator', 'final_grade_calculator_shortcode');

function sat_act_converter_shortcode() {
    return '<div id="sat-act-converter" class="uc-calculator-component"></div>';
}
add_shortcode('sat_act_converter', 'sat_act_converter_shortcode');

function uc_chancing_calculator_shortcode() {
    return '<div id="uc-chancing-calculator" class="uc-calculator-component"></div>';
}
add_shortcode('uc_chancing_calculator', 'uc_chancing_calculator_shortcode');

function service_tracker_shortcode() {
    return '<div id="service-tracker" class="uc-calculator-component"></div>';
}
add_shortcode('service_tracker', 'service_tracker_shortcode');