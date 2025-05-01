import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Service hours schema for tracking community service
export const serviceHours = pgTable("service_hours", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organization: text("organization").notNull(),
  description: text("description").notNull(),
  hours: integer("hours").notNull(),
  date: timestamp("date").notNull(),
  verified: boolean("verified").default(false),
  supervisorName: text("supervisor_name"),
  supervisorEmail: text("supervisor_email"),
  supervisorPhone: text("supervisor_phone"),
});

export const insertServiceHoursSchema = createInsertSchema(serviceHours).pick({
  userId: true,
  organization: true,
  description: true,
  hours: true,
  date: true,
  supervisorName: true,
  supervisorEmail: true,
  supervisorPhone: true,
});

export const ucGpaInputSchema = z.object({
  gradeA: z.number().min(0, "Number of A's must be non-negative"),
  gradeB: z.number().min(0, "Number of B's must be non-negative"),
  gradeC: z.number().min(0, "Number of C's must be non-negative"),
  gradeD: z.number().min(0, "Number of D's must be non-negative"),
  gradeF: z.number().min(0, "Number of F's must be non-negative"),
  honorsCount: z.number().min(0, "Number of honors/AP/IB courses must be non-negative"),
  academicSystem: z.enum(["semester", "trimester"]),
});

export const finalGradeInputSchema = z.object({
  currentGrade: z.number().min(0).max(100),
  currentWeight: z.number().min(0).max(100),
  finalWeight: z.number().min(0).max(100),
  desiredGrade: z.number().min(0).max(100),
});

export const satActSchema = z.object({
  testType: z.enum(["SAT", "ACT"]),
  score: z.number().min(1),
});

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertServiceHours = z.infer<typeof insertServiceHoursSchema>;
export type ServiceHours = typeof serviceHours.$inferSelect;
export type UcGpaInput = z.infer<typeof ucGpaInputSchema>;
export type FinalGradeInput = z.infer<typeof finalGradeInputSchema>;
export type SatActConversion = z.infer<typeof satActSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
