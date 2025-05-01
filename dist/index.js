// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  serviceHoursData;
  userId;
  serviceHoursId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.serviceHoursData = /* @__PURE__ */ new Map();
    this.userId = 1;
    this.serviceHoursId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getServiceHoursByUserId(userId) {
    return Array.from(this.serviceHoursData.values()).filter(
      (record) => record.userId === userId
    );
  }
  async getServiceHoursById(id) {
    return this.serviceHoursData.get(id);
  }
  async addServiceHours(data) {
    const id = this.serviceHoursId++;
    const serviceHoursRecord = {
      ...data,
      id,
      verified: false
    };
    this.serviceHoursData.set(id, serviceHoursRecord);
    return serviceHoursRecord;
  }
  async updateServiceHours(id, data) {
    const existingRecord = this.serviceHoursData.get(id);
    if (!existingRecord) {
      return void 0;
    }
    const updatedRecord = { ...existingRecord, ...data };
    this.serviceHoursData.set(id, updatedRecord);
    return updatedRecord;
  }
  async deleteServiceHours(id) {
    this.serviceHoursData.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var serviceHours = pgTable("service_hours", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organization: text("organization").notNull(),
  description: text("description").notNull(),
  hours: integer("hours").notNull(),
  date: timestamp("date").notNull(),
  verified: boolean("verified").default(false),
  supervisorName: text("supervisor_name"),
  supervisorEmail: text("supervisor_email"),
  supervisorPhone: text("supervisor_phone")
});
var insertServiceHoursSchema = createInsertSchema(serviceHours).pick({
  userId: true,
  organization: true,
  description: true,
  hours: true,
  date: true,
  supervisorName: true,
  supervisorEmail: true,
  supervisorPhone: true
});
var ucGpaInputSchema = z.object({
  gradeA: z.number().min(0, "Number of A's must be non-negative"),
  gradeB: z.number().min(0, "Number of B's must be non-negative"),
  gradeC: z.number().min(0, "Number of C's must be non-negative"),
  gradeD: z.number().min(0, "Number of D's must be non-negative"),
  gradeF: z.number().min(0, "Number of F's must be non-negative"),
  honorsCount: z.number().min(0, "Number of honors/AP/IB courses must be non-negative"),
  academicSystem: z.enum(["semester", "trimester"])
});
var finalGradeInputSchema = z.object({
  currentGrade: z.number().min(0).max(100),
  currentWeight: z.number().min(0).max(100),
  finalWeight: z.number().min(0).max(100),
  desiredGrade: z.number().min(0).max(100)
});
var satActSchema = z.object({
  testType: z.enum(["SAT", "ACT"]),
  score: z.number().min(1)
});
var contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/service-hours/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const serviceHours2 = await storage.getServiceHoursByUserId(userId);
      return res.json(serviceHours2);
    } catch (error) {
      console.error("Error fetching service hours:", error);
      return res.status(500).json({ message: "Failed to fetch service hours" });
    }
  });
  app2.post("/api/service-hours", async (req, res) => {
    try {
      const validatedData = insertServiceHoursSchema.parse(req.body);
      const serviceHour = await storage.addServiceHours(validatedData);
      return res.status(201).json(serviceHour);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding service hours:", error);
      return res.status(500).json({ message: "Failed to add service hours" });
    }
  });
  app2.delete("/api/service-hours/:id", async (req, res) => {
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
  app2.post("/api/calculate/uc-gpa", (req, res) => {
    try {
      const input = ucGpaInputSchema.parse(req.body);
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
      const totalGradePoints = input.gradeA * 4 + input.gradeB * 3 + input.gradeC * 2 + input.gradeD * 1 + input.gradeF * 0;
      const unweightedGPA = totalGradePoints / totalCourses;
      const maxHonorsCourses = input.academicSystem === "semester" ? 8 : 12;
      const cappedHonorsCount = Math.min(input.honorsCount, maxHonorsCourses);
      const weightedPoints = cappedHonorsCount;
      const weightedGPA = unweightedGPA + weightedPoints / totalCourses;
      return res.json({
        unweightedGPA: parseFloat(unweightedGPA.toFixed(2)),
        weightedGPA: parseFloat(weightedGPA.toFixed(2)),
        weightedPoints: parseFloat((weightedPoints / totalCourses).toFixed(2)),
        honorsCount: cappedHonorsCount,
        totalCourses
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error calculating UC GPA:", error);
      return res.status(500).json({ message: "Failed to calculate UC GPA" });
    }
  });
  app2.post("/api/calculate/final-grade", (req, res) => {
    try {
      const { currentGrade, currentWeight, finalWeight, desiredGrade } = finalGradeInputSchema.parse(req.body);
      if (currentWeight + finalWeight !== 100) {
        return res.status(400).json({
          message: "Current grade weight and final exam weight must sum to 100%"
        });
      }
      const neededGrade = (desiredGrade - currentGrade * (currentWeight / 100)) / (finalWeight / 100);
      let letterGrade = "";
      if (neededGrade >= 90) letterGrade = "A";
      else if (neededGrade >= 80) letterGrade = "B";
      else if (neededGrade >= 70) letterGrade = "C";
      else if (neededGrade >= 60) letterGrade = "D";
      else letterGrade = "F";
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error calculating final grade:", error);
      return res.status(500).json({ message: "Failed to calculate final grade" });
    }
  });
  app2.post("/api/calculate/sat-act", (req, res) => {
    try {
      const { testType, score } = satActSchema.parse(req.body);
      const satToAct = {
        1600: 36,
        1560: 35,
        1520: 34,
        1490: 33,
        1450: 32,
        1420: 31,
        1390: 30,
        1360: 29,
        1330: 28,
        1300: 27,
        1260: 26,
        1230: 25,
        1200: 24,
        1160: 23,
        1130: 22,
        1100: 21,
        1060: 20,
        1030: 19,
        990: 18,
        960: 17,
        920: 16,
        880: 15,
        830: 14,
        780: 13,
        730: 12,
        690: 11,
        650: 10,
        620: 9
      };
      const actToSat = {
        36: 1600,
        35: 1560,
        34: 1520,
        33: 1490,
        32: 1450,
        31: 1420,
        30: 1390,
        29: 1360,
        28: 1330,
        27: 1300,
        26: 1260,
        25: 1230,
        24: 1200,
        23: 1160,
        22: 1130,
        21: 1100,
        20: 1060,
        19: 1030,
        18: 990,
        17: 960,
        16: 920,
        15: 880,
        14: 830,
        13: 780,
        12: 730,
        11: 690,
        10: 650,
        9: 620
      };
      let convertedScore = null;
      if (testType === "SAT") {
        const satScores = Object.keys(satToAct).map(Number);
        const closestSat = satScores.reduce(
          (prev, curr) => Math.abs(curr - score) < Math.abs(prev - score) ? curr : prev
        );
        convertedScore = satToAct[closestSat];
      } else {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error converting SAT/ACT score:", error);
      return res.status(500).json({ message: "Failed to convert score" });
    }
  });
  app2.post("/api/calculate/uc-chance", (req, res) => {
    try {
      const data = req.body;
      if (!data.gpa || !data.activities || !data.essays) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const campuses = [
        "UC Berkeley",
        "UCLA",
        "UC San Diego",
        "UC Irvine",
        "UC Davis",
        "UC Santa Barbara",
        "UC Santa Cruz",
        "UC Riverside",
        "UC Merced"
      ];
      const results = campuses.map((campus) => {
        let baseChance = 0;
        if (data.gpa >= 4) baseChance += 50;
        else if (data.gpa >= 3.8) baseChance += 40;
        else if (data.gpa >= 3.5) baseChance += 30;
        else if (data.gpa >= 3) baseChance += 20;
        else baseChance += 10;
        baseChance += Math.min(20, data.activities * 4);
        baseChance += Math.min(15, data.essays * 3);
        if (data.satScore) {
          if (data.satScore >= 1500) baseChance += 15;
          else if (data.satScore >= 1400) baseChance += 12;
          else if (data.satScore >= 1300) baseChance += 8;
          else if (data.satScore >= 1200) baseChance += 5;
          else baseChance += 2;
        }
        let campusAdjustment = 0;
        if (campus === "UC Berkeley" || campus === "UCLA") {
          campusAdjustment = -15;
        } else if (campus === "UC Merced" || campus === "UC Riverside") {
          campusAdjustment = 15;
        }
        let chance = Math.min(99, Math.max(1, baseChance + campusAdjustment));
        return {
          campus,
          chance,
          tier: chance >= 70 ? "Likely" : chance >= 40 ? "Target" : "Reach"
        };
      });
      return res.json({
        results,
        overallAssessment: data.gpa >= 3.8 ? "Strong candidate for most UC campuses" : data.gpa >= 3.5 ? "Competitive for many UC campuses" : "Consider focusing on less competitive UC campuses"
      });
    } catch (error) {
      console.error("Error calculating UC chances:", error);
      return res.status(500).json({ message: "Failed to calculate UC chances" });
    }
  });
  app2.post("/api/contact", (req, res) => {
    try {
      const { name, email, subject, message } = contactFormSchema.parse(req.body);
      return res.json({
        success: true,
        message: "Message received successfully. We'll get back to you soon!"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error processing contact form:", error);
      return res.status(500).json({ message: "Failed to process contact form" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
