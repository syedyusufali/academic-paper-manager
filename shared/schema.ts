import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  targetWordCount: integer("target_word_count").notNull().default(5000),
  currentWordCount: integer("current_word_count").notNull().default(0),
  status: text("status").notNull().default("research"), // research, draft, revision, completed
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").references(() => papers.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").references(() => papers.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  section: text("section"), // introduction, methodology, results, conclusion, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const progressEntries = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").references(() => papers.id).notNull(),
  date: timestamp("date").notNull(),
  wordsWritten: integer("words_written").notNull().default(0),
  timeSpent: integer("time_spent").notNull().default(0), // in minutes
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
  createdAt: true,
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
