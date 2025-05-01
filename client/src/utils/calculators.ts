// Grade point values
const gradePoints = {
  'A': 4.0,
  'B': 3.0, 
  'C': 2.0,
  'D': 1.0,
  'F': 0.0
};

// UC GPA calculation
export const calculateUcGpa = (
  input: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeF: number;
    honorsCount: number;
    academicSystem: 'semester' | 'trimester';
  }
) => {
  // Get total number of courses
  const totalCourses = input.gradeA + input.gradeB + input.gradeC + input.gradeD + input.gradeF;
  
  if (totalCourses === 0) {
    return { 
      unweightedGPA: 0, 
      weightedGPA: 0, 
      weightedPoints: 0, 
      honorsCount: input.honorsCount,
      totalCourses: 0
    };
  }
  
  // Calculate grade points
  const totalGradePoints = 
    (input.gradeA * gradePoints['A']) + 
    (input.gradeB * gradePoints['B']) + 
    (input.gradeC * gradePoints['C']) + 
    (input.gradeD * gradePoints['D']) + 
    (input.gradeF * gradePoints['F']);
  
  // Calculate unweighted GPA
  const unweightedGPA = totalGradePoints / totalCourses;
  
  // Calculate honors points
  // For UC system, only A, B, C grades in honors/AP/IB earn extra points
  // Maximum 8 semester courses or 12 trimester courses can earn honors/AP/IB points
  const maxHonorsCourses = input.academicSystem === 'semester' ? 8 : 12;
  const cappedHonorsCount = Math.min(input.honorsCount, maxHonorsCourses);
  
  // Calculate weighted points and GPA
  const weightedPoints = cappedHonorsCount;
  const weightedGPA = unweightedGPA + (weightedPoints / totalCourses);
  
  return {
    unweightedGPA,
    weightedGPA,
    weightedPoints,
    honorsCount: cappedHonorsCount,
    totalCourses
  };
};

// Final grade calculation
export const calculateFinalGrade = (
  currentGrade: number,
  currentWeight: number,
  finalWeight: number,
  desiredGrade: number
) => {
  // Validate weights add up to 100%
  if (currentWeight + finalWeight !== 100) {
    throw new Error("Current grade weight and final exam weight must sum to 100%");
  }
  
  // Calculate needed final exam grade
  // Formula: (desiredGrade - currentGrade * (currentWeight/100)) / (finalWeight/100)
  const neededGrade = (desiredGrade - (currentGrade * (currentWeight / 100))) / (finalWeight / 100);
  
  // Determine letter grade
  let letterGrade = "";
  if (neededGrade >= 90) letterGrade = "A";
  else if (neededGrade >= 80) letterGrade = "B";
  else if (neededGrade >= 70) letterGrade = "C";
  else if (neededGrade >= 60) letterGrade = "D";
  else letterGrade = "F";
  
  // Determine feasibility message
  let feasibilityMessage = "";
  if (neededGrade <= 100) {
    if (neededGrade <= 70) {
      feasibilityMessage = "This grade is easily achievable with minimal preparation.";
    } else if (neededGrade <= 90) {
      feasibilityMessage = "This grade is achievable with good preparation.";
    } else {
      feasibilityMessage = "This grade is challenging but possible with thorough preparation.";
    }
  } else {
    feasibilityMessage = "This grade is not mathematically possible. Consider adjusting your desired grade.";
  }
  
  return {
    neededGrade,
    letterGrade,
    feasibilityMessage,
    isPossible: neededGrade <= 100
  };
};

// SAT/ACT Conversion Tables
// These are simplified versions of the concordance tables
const satToActMap: Record<number, number> = {
  1600: 36, 1560: 35, 1520: 34, 1490: 33, 1450: 32, 1420: 31,
  1390: 30, 1360: 29, 1330: 28, 1300: 27, 1260: 26, 1230: 25,
  1200: 24, 1160: 23, 1130: 22, 1100: 21, 1060: 20, 1030: 19,
  990: 18, 960: 17, 920: 16, 880: 15, 830: 14, 780: 13,
  730: 12, 690: 11, 650: 10, 620: 9
};

const actToSatMap: Record<number, number> = {
  36: 1600, 35: 1560, 34: 1520, 33: 1490, 32: 1450, 31: 1420,
  30: 1390, 29: 1360, 28: 1330, 27: 1300, 26: 1260, 25: 1230,
  24: 1200, 23: 1160, 22: 1130, 21: 1100, 20: 1060, 19: 1030,
  18: 990, 17: 960, 16: 920, 15: 880, 14: 830, 13: 780,
  12: 730, 11: 690, 10: 650, 9: 620
};

export const convertSatAct = (testType: 'SAT' | 'ACT', score: number) => {
  if (testType === 'SAT') {
    // Find the closest SAT score in the table
    const satScores = Object.keys(satToActMap).map(Number);
    const closestSat = satScores.reduce((prev, curr) => 
      Math.abs(curr - score) < Math.abs(prev - score) ? curr : prev
    );
    return {
      originalTestType: 'SAT',
      originalScore: score,
      convertedTestType: 'ACT',
      convertedScore: satToActMap[closestSat]
    };
  } else {
    // Find the ACT score in the table
    return {
      originalTestType: 'ACT',
      originalScore: score,
      convertedTestType: 'SAT',
      convertedScore: actToSatMap[score] || null
    };
  }
};

// UC Chancing Calculator
export const calculateUcChances = (
  gpa: number,
  activities: number,
  essays: number,
  satScore?: number
) => {
  // List of UC campuses
  const campuses = [
    "UC Berkeley", "UCLA", "UC San Diego", "UC Irvine", 
    "UC Davis", "UC Santa Barbara", "UC Santa Cruz", "UC Riverside", "UC Merced"
  ];
  
  // Calculate chances for each campus
  const results = campuses.map(campus => {
    let baseChance = 0;
    
    // GPA factor (most important)
    if (gpa >= 4.0) baseChance += 50;
    else if (gpa >= 3.8) baseChance += 40;
    else if (gpa >= 3.5) baseChance += 30;
    else if (gpa >= 3.0) baseChance += 20;
    else baseChance += 10;
    
    // Activities factor
    baseChance += Math.min(20, activities * 4);
    
    // Essays factor
    baseChance += Math.min(15, essays * 3);
    
    // Tests factor (if provided)
    if (satScore) {
      if (satScore >= 1500) baseChance += 15;
      else if (satScore >= 1400) baseChance += 12;
      else if (satScore >= 1300) baseChance += 8;
      else if (satScore >= 1200) baseChance += 5;
      else baseChance += 2;
    }
    
    // Campus-specific adjustment
    let campusAdjustment = 0;
    if (campus === "UC Berkeley" || campus === "UCLA") {
      campusAdjustment = -15; // More competitive
    } else if (campus === "UC Merced" || campus === "UC Riverside") {
      campusAdjustment = 15; // Less competitive
    }
    
    // Calculate final chance, capped between 1-99%
    let chance = Math.min(99, Math.max(1, baseChance + campusAdjustment));
    
    // Determine tier based on chance
    let tier: "Likely" | "Target" | "Reach";
    if (chance >= 70) tier = "Likely";
    else if (chance >= 40) tier = "Target";
    else tier = "Reach";
    
    return {
      campus,
      chance,
      tier
    };
  });
  
  // Generate overall assessment
  let overallAssessment = "";
  if (gpa >= 3.8) {
    overallAssessment = "Strong candidate for most UC campuses";
  } else if (gpa >= 3.5) {
    overallAssessment = "Competitive for many UC campuses";
  } else {
    overallAssessment = "Consider focusing on less competitive UC campuses";
  }
  
  return {
    results,
    overallAssessment
  };
};
