<?php
// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Register REST API routes
function uc_calculator_register_rest_routes() {
    register_rest_route('uc-calculator/v1', '/calculate/uc-gpa', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_calculate_uc_gpa',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/calculate/final-grade', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_calculate_final_grade',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/calculate/sat-act', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_convert_sat_act',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/calculate/uc-chance', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_calculate_uc_chance',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/contact', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_process_contact',
        'permission_callback' => '__return_true'
    ));
    
    // Service hours endpoints (if using DB storage)
    register_rest_route('uc-calculator/v1', '/service-hours/get/(?P<userId>\d+)', array(
        'methods' => 'GET',
        'callback' => 'uc_calculator_get_service_hours',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/service-hours/add', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_add_service_hours',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/service-hours/update/(?P<id>\d+)', array(
        'methods' => 'POST',
        'callback' => 'uc_calculator_update_service_hours',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('uc-calculator/v1', '/service-hours/delete/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'uc_calculator_delete_service_hours',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'uc_calculator_register_rest_routes');

// UC GPA Calculator endpoint
function uc_calculator_calculate_uc_gpa($request) {
    header('Content-Type: application/json');
    $params = $request->get_json_params();
    
    // Extract parameters
    $gradeA = isset($params['gradeA']) ? intval($params['gradeA']) : 0;
    $gradeB = isset($params['gradeB']) ? intval($params['gradeB']) : 0;
    $gradeC = isset($params['gradeC']) ? intval($params['gradeC']) : 0;
    $gradeD = isset($params['gradeD']) ? intval($params['gradeD']) : 0;
    $gradeF = isset($params['gradeF']) ? intval($params['gradeF']) : 0;
    $honorsCount = isset($params['honorsCount']) ? intval($params['honorsCount']) : 0;
    $academicSystem = isset($params['academicSystem']) ? sanitize_text_field($params['academicSystem']) : 'semester';
    
    // Calculate UC GPA
    $totalCourses = $gradeA + $gradeB + $gradeC + $gradeD + $gradeF;
    
    if ($totalCourses === 0) {
        return array(
            'unweightedGPA' => 0,
            'weightedGPA' => 0,
            'weightedPoints' => 0,
            'honorsCount' => $honorsCount,
            'totalCourses' => 0
        );
    }
    
    // Calculate grade points
    $totalGradePoints = 
        ($gradeA * 4) + 
        ($gradeB * 3) + 
        ($gradeC * 2) + 
        ($gradeD * 1) + 
        ($gradeF * 0);
    
    // Calculate unweighted GPA
    $unweightedGPA = $totalGradePoints / $totalCourses;
    
    // Calculate honors points (capped at 8 for semester, 12 for trimester)
    $maxHonorsCourses = $academicSystem === 'semester' ? 8 : 12;
    $cappedHonorsCount = min($honorsCount, $maxHonorsCourses);
    
    // Calculate weighted points and GPA
    $weightedPoints = $cappedHonorsCount;
    $weightedGPA = $unweightedGPA + ($weightedPoints / $totalCourses);
    
    return array(
        'unweightedGPA' => round($unweightedGPA, 2),
        'weightedGPA' => round($weightedGPA, 2),
        'weightedPoints' => $weightedPoints,
        'honorsCount' => $cappedHonorsCount,
        'totalCourses' => $totalCourses
    );
}

// Final Grade Calculator endpoint
function uc_calculator_calculate_final_grade($request) {
    $params = $request->get_json_params();
    
    // Extract parameters
    $currentGrade = isset($params['currentGrade']) ? floatval($params['currentGrade']) : 0;
    $currentWeight = isset($params['currentWeight']) ? floatval($params['currentWeight']) : 0;
    $desiredGrade = isset($params['desiredGrade']) ? floatval($params['desiredGrade']) : 0;
    $finalWeight = isset($params['finalWeight']) ? floatval($params['finalWeight']) : 0;
    
    // Calculate needed final exam grade
    if ($finalWeight === 0) {
        return new WP_Error('invalid_data', 'Final exam weight cannot be zero.', array('status' => 400));
    }
    
    // Formula: (DesiredGrade - (CurrentGrade * (1 - FinalWeight))) / FinalWeight
    $currentWeightDecimal = $currentWeight / 100;
    $finalWeightDecimal = $finalWeight / 100;
    
    $neededGrade = ($desiredGrade - ($currentGrade * (1 - $finalWeightDecimal))) / $finalWeightDecimal;
    $neededGrade = round($neededGrade, 2);
    
    // Determine letter grade
    $letterGrade = '';
    if ($neededGrade >= 90) {
        $letterGrade = 'A';
    } elseif ($neededGrade >= 80) {
        $letterGrade = 'B';
    } elseif ($neededGrade >= 70) {
        $letterGrade = 'C';
    } elseif ($neededGrade >= 60) {
        $letterGrade = 'D';
    } else {
        $letterGrade = 'F';
    }
    
    // Determine feasibility
    $isPossible = $neededGrade <= 100;
    $feasibilityMessage = $isPossible 
        ? "You need a $neededGrade% ($letterGrade) on the final exam to achieve your desired grade."
        : "It's not mathematically possible to achieve your desired grade. The highest possible final grade would require a score above 100%.";
    
    return array(
        'neededGrade' => $neededGrade,
        'letterGrade' => $letterGrade,
        'feasibilityMessage' => $feasibilityMessage,
        'isPossible' => $isPossible
    );
}

// SAT/ACT Conversion endpoint
function uc_calculator_convert_sat_act($request) {
    $params = $request->get_json_params();
    
    // Extract parameters
    $testType = isset($params['testType']) ? sanitize_text_field($params['testType']) : '';
    $score = isset($params['score']) ? intval($params['score']) : 0;
    
    // Validate input
    if ($testType !== 'SAT' && $testType !== 'ACT') {
        return new WP_Error('invalid_data', 'Test type must be either SAT or ACT.', array('status' => 400));
    }
    
    // Define conversion tables (based on College Board and ACT, Inc. concordance tables)
    $satToAct = array(
        1600 => 36, 1590 => 36, 1580 => 36, 1570 => 36, 1560 => 35, 1550 => 35, 1540 => 35,
        1530 => 34, 1520 => 34, 1510 => 34, 1500 => 33, 1490 => 33, 1480 => 33, 1470 => 32,
        1460 => 32, 1450 => 32, 1440 => 31, 1430 => 31, 1420 => 31, 1410 => 30, 1400 => 30,
        1390 => 30, 1380 => 29, 1370 => 29, 1360 => 29, 1350 => 28, 1340 => 28, 1330 => 28,
        1320 => 27, 1310 => 27, 1300 => 27, 1290 => 26, 1280 => 26, 1270 => 26, 1260 => 25,
        1250 => 25, 1240 => 25, 1230 => 24, 1220 => 24, 1210 => 24, 1200 => 23, 1190 => 23,
        1180 => 23, 1170 => 22, 1160 => 22, 1150 => 22, 1140 => 21, 1130 => 21, 1120 => 21,
        1110 => 20, 1100 => 20, 1090 => 20, 1080 => 19, 1070 => 19, 1060 => 19, 1050 => 18,
        1040 => 18, 1030 => 18, 1020 => 17, 1010 => 17, 1000 => 17, 990 => 16, 980 => 16,
        970 => 16, 960 => 15, 950 => 15, 940 => 15, 930 => 14, 920 => 14, 910 => 14,
        900 => 13, 890 => 13, 880 => 13, 870 => 12, 860 => 12, 850 => 12, 840 => 11,
        830 => 11, 820 => 11, 810 => 10, 800 => 10, 790 => 10, 780 => 9, 770 => 9,
        760 => 9, 750 => 8, 740 => 8, 730 => 8, 720 => 7, 710 => 7, 700 => 7,
        690 => 6, 680 => 6, 670 => 6, 660 => 5, 650 => 5, 640 => 5, 630 => 4,
        620 => 4, 610 => 4, 600 => 3, 590 => 3, 580 => 3, 570 => 2, 560 => 2,
        550 => 2, 540 => 1, 530 => 1, 520 => 1, 510 => 1, 500 => 1, 490 => 1,
        480 => 1, 470 => 1, 460 => 1, 450 => 1, 440 => 1, 430 => 1, 420 => 1,
        410 => 1, 400 => 1
    );
    
    $actToSat = array(
        36 => 1590, 35 => 1550, 34 => 1510, 33 => 1480, 32 => 1450, 31 => 1420, 30 => 1390,
        29 => 1360, 28 => 1330, 27 => 1300, 26 => 1260, 25 => 1230, 24 => 1200, 23 => 1170,
        22 => 1140, 21 => 1110, 20 => 1080, 19 => 1050, 18 => 1020, 17 => 990, 16 => 960,
        15 => 930, 14 => 900, 13 => 870, 12 => 840, 11 => 810, 10 => 780, 9 => 750,
        8 => 720, 7 => 690, 6 => 660, 5 => 630, 4 => 600, 3 => 570, 2 => 540, 1 => 500
    );
    
    // Perform conversion
    $convertedScore = 0;
    $convertedTestType = '';
    
    if ($testType === 'SAT') {
        // Convert SAT to ACT
        // Ensure valid SAT score range
        if ($score < 400 || $score > 1600) {
            return new WP_Error('invalid_data', 'SAT score must be between 400 and 1600.', array('status' => 400));
        }
        
        // Find nearest score match
        foreach ($satToAct as $satScore => $actScore) {
            if ($score >= $satScore) {
                $convertedScore = $actScore;
                break;
            }
        }
        
        $convertedTestType = 'ACT';
    } else {
        // Convert ACT to SAT
        // Ensure valid ACT score range
        if ($score < 1 || $score > 36) {
            return new WP_Error('invalid_data', 'ACT score must be between 1 and 36.', array('status' => 400));
        }
        
        $convertedScore = isset($actToSat[$score]) ? $actToSat[$score] : 0;
        $convertedTestType = 'SAT';
    }
    
    return array(
        'originalTestType' => $testType,
        'originalScore' => $score,
        'convertedTestType' => $convertedTestType,
        'convertedScore' => $convertedScore
    );
}

// UC Chancing Calculator endpoint
function uc_calculator_calculate_uc_chance($request) {
    $params = $request->get_json_params();
    
    // Extract parameters
    $gpa = isset($params['gpa']) ? floatval($params['gpa']) : 0;
    $testType = isset($params['testType']) ? sanitize_text_field($params['testType']) : 'SAT';
    $testScore = isset($params['testScore']) ? intval($params['testScore']) : 0;
    $extracurriculars = isset($params['extracurriculars']) ? intval($params['extracurriculars']) : 0;
    $essays = isset($params['essays']) ? intval($params['essays']) : 0;
    $selectedCampuses = isset($params['selectedCampuses']) ? (array)$params['selectedCampuses'] : array();
    
    // Define UC campuses and their selectivity factors
    $campuses = array(
        'Berkeley' => 0.9,
        'Los Angeles' => 0.88,
        'San Diego' => 0.75,
        'Irvine' => 0.7,
        'Davis' => 0.65,
        'Santa Barbara' => 0.6,
        'Santa Cruz' => 0.55,
        'Riverside' => 0.5,
        'Merced' => 0.4
    );
    
    // Calculate base chance from GPA (weighted heavily for UC)
    // UC uses a 4.0 scale with honors capped for UC GPA
    $gpaFactor = 0;
    if ($gpa >= 4.2) {
        $gpaFactor = 0.9; // Excellent chance with this GPA
    } elseif ($gpa >= 4.0) {
        $gpaFactor = 0.8;
    } elseif ($gpa >= 3.8) {
        $gpaFactor = 0.7;
    } elseif ($gpa >= 3.6) {
        $gpaFactor = 0.6;
    } elseif ($gpa >= 3.4) {
        $gpaFactor = 0.5;
    } elseif ($gpa >= 3.2) {
        $gpaFactor = 0.4;
    } elseif ($gpa >= 3.0) {
        $gpaFactor = 0.3;
    } else {
        $gpaFactor = 0.2;
    }
    
    // Calculate test score factor (note: UC system is test-blind since 2020, but we'll include for completeness)
    $testFactor = 0;
    if ($testType === 'SAT') {
        if ($testScore >= 1500) {
            $testFactor = 0.2;
        } elseif ($testScore >= 1400) {
            $testFactor = 0.15;
        } elseif ($testScore >= 1300) {
            $testFactor = 0.1;
        } elseif ($testScore >= 1200) {
            $testFactor = 0.05;
        } else {
            $testFactor = 0;
        }
    } else { // ACT
        if ($testScore >= 34) {
            $testFactor = 0.2;
        } elseif ($testScore >= 32) {
            $testFactor = 0.15;
        } elseif ($testScore >= 30) {
            $testFactor = 0.1;
        } elseif ($testScore >= 28) {
            $testFactor = 0.05;
        } else {
            $testFactor = 0;
        }
    }
    
    // Extracurricular factor (scale of 1-10)
    $ecFactor = min(max($extracurriculars, 1), 10) / 50; // Max contribution 0.2
    
    // Essays factor (scale of 1-10)
    $essayFactor = min(max($essays, 1), 10) / 50; // Max contribution 0.2
    
    // Calculate results for each selected campus
    $results = array();
    foreach ($selectedCampuses as $campus) {
        if (isset($campuses[$campus])) {
            $selectivityFactor = $campuses[$campus];
            
            // Calculate raw chance
            $chance = ($gpaFactor + $testFactor + $ecFactor + $essayFactor) * (1 - $selectivityFactor);
            
            // Convert to percentage and cap at 95%
            $chancePercent = min(round($chance * 100), 95);
            
            // Determine tier
            $tier = '';
            if ($chancePercent >= 70) {
                $tier = 'Likely';
            } elseif ($chancePercent >= 40) {
                $tier = 'Target';
            } else {
                $tier = 'Reach';
            }
            
            $results[] = array(
                'campus' => $campus,
                'chance' => $chancePercent,
                'tier' => $tier
            );
        }
    }
    
    // Sort results by chance (descending)
    usort($results, function($a, $b) {
        return $b['chance'] - $a['chance'];
    });
    
    // Generate overall assessment
    $overallAssessment = '';
    $highestChance = count($results) > 0 ? $results[0]['chance'] : 0;
    $lowestChance = count($results) > 0 ? end($results)['chance'] : 0;
    
    if ($highestChance >= 70) {
        $overallAssessment = 'Your academic profile is strong for at least one of your selected UC campuses. Focus on maintaining your GPA and developing your extracurricular activities and personal statements.';
    } elseif ($highestChance >= 50) {
        $overallAssessment = 'You have a competitive chance at some of your selected UC campuses. Continue to strengthen your application and consider adding some safer options.';
    } elseif ($highestChance >= 30) {
        $overallAssessment = 'Your profile is within the range for consideration, but these schools should be considered reach schools. Consider adding more target and safety schools to your list.';
    } else {
        $overallAssessment = 'The UC schools you\'ve selected are highly competitive for your current profile. Consider focusing on improving your GPA and strengthening other aspects of your application.';
    }
    
    return array(
        'results' => $results,
        'overallAssessment' => $overallAssessment
    );
}

// Contact form submission endpoint
function uc_calculator_process_contact($request) {
    $params = $request->get_json_params();
    
    // Extract parameters
    $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $message = isset($params['message']) ? sanitize_textarea_field($params['message']) : '';
    
    // Validate data
    if (empty($name) || empty($email) || empty($message)) {
        return new WP_Error('missing_data', 'Please fill out all required fields.', array('status' => 400));
    }
    
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Please enter a valid email address.', array('status' => 400));
    }
    
    // Get admin email
    $admin_email = get_option('admin_email');
    
    // Email subject
    $subject = 'New Contact Form Submission from UC Calculator';
    
    // Email content
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message\n";
    
    // Headers
    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . $name . ' <' . $email . '>',
        'Reply-To: ' . $email
    );
    
    // Send email
    $sent = wp_mail($admin_email, $subject, $email_content, $headers);
    
    if ($sent) {
        return array(
            'success' => true,
            'message' => 'Your message has been sent. We\'ll get back to you soon!'
        );
    } else {
        return new WP_Error('email_failed', 'Unable to send your message. Please try again later.', array('status' => 500));
    }
}

// The following functions require a database for service hours
// Add these if implementing the service tracker feature with database storage

// Get service hours for a user
function uc_calculator_get_service_hours($request) {
    $userId = $request['userId'];
    
    // This is a simplified example. In a real implementation, you would:
    // 1. Query your database table for service hours matching the user ID
    // 2. Return the results as an array
    
    // Placeholder implementation (needs database table)
    return array(
        'message' => 'Database implementation required for service hours tracking',
        'userId' => $userId
    );
}

// Add service hours
function uc_calculator_add_service_hours($request) {
    $params = $request->get_json_params();
    
    // Extract parameters
    $userId = isset($params['userId']) ? intval($params['userId']) : 0;
    $organization = isset($params['organization']) ? sanitize_text_field($params['organization']) : '';
    $date = isset($params['date']) ? sanitize_text_field($params['date']) : '';
    $hours = isset($params['hours']) ? floatval($params['hours']) : 0;
    $description = isset($params['description']) ? sanitize_textarea_field($params['description']) : '';
    
    // Placeholder implementation (needs database table)
    return array(
        'message' => 'Database implementation required for service hours tracking',
        'success' => false
    );
}

// Update service hours
function uc_calculator_update_service_hours($request) {
    $id = $request['id'];
    $params = $request->get_json_params();
    
    // Placeholder implementation (needs database table)
    return array(
        'message' => 'Database implementation required for service hours tracking',
        'success' => false,
        'id' => $id
    );
}

// Delete service hours
function uc_calculator_delete_service_hours($request) {
    $id = $request['id'];
    
    // Placeholder implementation (needs database table)
    return array(
        'message' => 'Database implementation required for service hours tracking',
        'success' => false,
        'id' => $id
    );
}