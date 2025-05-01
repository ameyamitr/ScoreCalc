import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertServiceHoursSchema,
  contactFormSchema,
  ucGpaInputSchema,
  finalGradeInputSchema,
  satActSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Service hours tracker routes
  app.get("/api/service-hours/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const serviceHours = await storage.getServiceHoursByUserId(userId);
      return res.json(serviceHours);
    } catch (error) {
      console.error("Error fetching service hours:", error);
      return res.status(500).json({ message: "Failed to fetch service hours" });
    }
  });

  app.post("/api/service-hours", async (req, res) => {
    try {
      const validatedData = insertServiceHoursSchema.parse(req.body);
      const serviceHour = await storage.addServiceHours(validatedData);
      return res.status(201).json(serviceHour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding service hours:", error);
      return res.status(500).json({ message: "Failed to add service hours" });
    }
  });

  app.delete("/api/service-hours/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service hour ID" });
      }
      
      await storage.deleteServiceHours(id);
      return res.json({ message: "Service hours deleted successfully" });
    } catch (error) {
      console.error("Error deleting service hours:", error);
      return res.status(500).json({ message: "Failed to delete service hours" });
    }
  });

  // UC GPA Calculator endpoint
  app.post("/api/calculate/uc-gpa", (req, res) => {
    try {
      const input = ucGpaInputSchema.parse(req.body);
      
      // Get total number of courses
      const totalCourses = input.gradeA + input.gradeB + input.gradeC + input.gradeD + input.gradeF;
      
      if (totalCourses === 0) {
        return res.json({
          unweightedGPA: 0,
          weightedGPA: 0,
          weightedPoints: 0,
          honorsCount: input.honorsCount,
          totalCourses: 0
        });
      }
      
      // Calculate grade points
      const totalGradePoints = 
        (input.gradeA * 4) + 
        (input.gradeB * 3) + 
        (input.gradeC * 2) + 
        (input.gradeD * 1) + 
        (input.gradeF * 0);
      
      // Calculate unweighted GPA
      const unweightedGPA = totalGradePoints / totalCourses;
      
      // Calculate honors points
      // Maximum 8 semester courses or 12 trimester courses can earn honors/AP/IB points
      const maxHonorsCourses = input.academicSystem === "semester" ? 8 : 12;
      const cappedHonorsCount = Math.min(input.honorsCount, maxHonorsCourses);
      
      // Calculate weighted points and GPA
      const weightedPoints = cappedHonorsCount;
      const weightedGPA = unweightedGPA + (weightedPoints / totalCourses);
      
      return res.json({
        unweightedGPA: parseFloat(unweightedGPA.toFixed(2)),
        weightedGPA: parseFloat(weightedGPA.toFixed(2)),
        weightedPoints: parseFloat((weightedPoints / totalCourses).toFixed(2)),
        honorsCount: cappedHonorsCount,
        totalCourses
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error calculating UC GPA:", error);
      return res.status(500).json({ message: "Failed to calculate UC GPA" });
    }
  });

  // Final Grade Calculator endpoint
  app.post("/api/calculate/final-grade", (req, res) => {
    try {
      const { currentGrade, currentWeight, finalWeight, desiredGrade } = 
        finalGradeInputSchema.parse(req.body);
      
      // Validate weights add up to 100%
      if (currentWeight + finalWeight !== 100) {
        return res.status(400).json({ 
          message: "Current grade weight and final exam weight must sum to 100%" 
        });
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
      
      return res.json({
        neededGrade: parseFloat(neededGrade.toFixed(2)),
        letterGrade,
        feasibilityMessage,
        isPossible: neededGrade <= 100
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error calculating final grade:", error);
      return res.status(500).json({ message: "Failed to calculate final grade" });
    }
  });

  // SAT/ACT Conversion endpoint
  app.post("/api/calculate/sat-act", (req, res) => {
    try {
      const { testType, score } = satActSchema.parse(req.body);
      
      // Conversion tables (simplified version)
      const satToAct: Record<number, number> = {
        1600: 36, 1560: 35, 1520: 34, 1490: 33, 1450: 32, 1420: 31,
        1390: 30, 1360: 29, 1330: 28, 1300: 27, 1260: 26, 1230: 25,
        1200: 24, 1160: 23, 1130: 22, 1100: 21, 1060: 20, 1030: 19,
        990: 18, 960: 17, 920: 16, 880: 15, 830: 14, 780: 13,
        730: 12, 690: 11, 650: 10, 620: 9
      };
      
      const actToSat: Record<number, number> = {
        36: 1600, 35: 1560, 34: 1520, 33: 1490, 32: 1450, 31: 1420,
        30: 1390, 29: 1360, 28: 1330, 27: 1300, 26: 1260, 25: 1230,
        24: 1200, 23: 1160, 22: 1130, 21: 1100, 20: 1060, 19: 1030,
        18: 990, 17: 960, 16: 920, 15: 880, 14: 830, 13: 780,
        12: 730, 11: 690, 10: 650, 9: 620
      };
      
      let convertedScore: number | null = null;
      
      if (testType === "SAT") {
        // Find the closest SAT score in the table
        const satScores = Object.keys(satToAct).map(Number);
        const closestSat = satScores.reduce((prev, curr) => 
          Math.abs(curr - score) < Math.abs(prev - score) ? curr : prev
        );
        convertedScore = satToAct[closestSat];
      } else {
        // Find the ACT score in the table
        convertedScore = actToSat[score] || null;
      }
      
      if (convertedScore === null) {
        return res.status(400).json({ message: "Unable to convert score. Invalid score range." });
      }
      
      return res.json({
        originalTestType: testType,
        originalScore: score,
        convertedTestType: testType === "SAT" ? "ACT" : "SAT",
        convertedScore
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error converting SAT/ACT score:", error);
      return res.status(500).json({ message: "Failed to convert score" });
    }
  });
  
  // UC Chancing Calculator endpoint
  app.post("/api/calculate/uc-chance", (req, res) => {
    try {
      const data = req.body;
      // Basic validation
      if (!data.gpa || !data.activities || !data.essays) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Calculate chances for each UC campus
      // This is a simplified model for demonstration
      const campuses = [
        "UC Berkeley", "UCLA", "UC San Diego", "UC Irvine", 
        "UC Davis", "UC Santa Barbara", "UC Santa Cruz", "UC Riverside", "UC Merced"
      ];
      
      const results = campuses.map(campus => {
        let baseChance = 0;
        
        // GPA factor (most important)
        if (data.gpa >= 4.0) baseChance += 50;
        else if (data.gpa >= 3.8) baseChance += 40;
        else if (data.gpa >= 3.5) baseChance += 30;
        else if (data.gpa >= 3.0) baseChance += 20;
        else baseChance += 10;
        
        // Activities factor
        baseChance += Math.min(20, data.activities * 4);
        
        // Essays factor
        baseChance += Math.min(15, data.essays * 3);
        
        // Tests factor (if provided)
        if (data.satScore) {
          if (data.satScore >= 1500) baseChance += 15;
          else if (data.satScore >= 1400) baseChance += 12;
          else if (data.satScore >= 1300) baseChance += 8;
          else if (data.satScore >= 1200) baseChance += 5;
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
        
        return {
          campus,
          chance,
          tier: chance >= 70 ? "Likely" : chance >= 40 ? "Target" : "Reach"
        };
      });
      
      return res.json({
        results,
        overallAssessment: data.gpa >= 3.8 ? 
          "Strong candidate for most UC campuses" : 
          data.gpa >= 3.5 ? 
          "Competitive for many UC campuses" : 
          "Consider focusing on less competitive UC campuses"
      });
      
    } catch (error) {
      console.error("Error calculating UC chances:", error);
      return res.status(500).json({ message: "Failed to calculate UC chances" });
    }
  });

  // Contact form endpoint
  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, subject, message } = contactFormSchema.parse(req.body);
      
      // In a real application, you would send an email or save to database
      // For this demo, we'll just return success
      
      return res.json({
        success: true,
        message: "Message received successfully. We'll get back to you soon!"
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error processing contact form:", error);
      return res.status(500).json({ message: "Failed to process contact form" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
