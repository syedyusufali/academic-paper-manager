import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaperSchema, insertMilestoneSchema, insertNoteSchema, insertProgressEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Papers
  app.get("/api/papers", async (req, res) => {
    try {
      const papers = await storage.getPapers();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  app.get("/api/papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paper = await storage.getPaper(id);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paper" });
    }
  });

  app.post("/api/papers", async (req, res) => {
    try {
      const paper = insertPaperSchema.parse(req.body);
      const createdPaper = await storage.createPaper(paper);
      res.status(201).json(createdPaper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid paper data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create paper" });
    }
  });

  app.put("/api/papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertPaperSchema.partial().parse(req.body);
      const updatedPaper = await storage.updatePaper(id, updates);
      if (!updatedPaper) {
        return res.status(404).json({ message: "Paper not found" });
      }
      res.json(updatedPaper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid paper data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update paper" });
    }
  });

  app.delete("/api/papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePaper(id);
      if (!deleted) {
        return res.status(404).json({ message: "Paper not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete paper" });
    }
  });

  // Milestones
  app.get("/api/milestones", async (req, res) => {
    try {
      const paperId = req.query.paperId ? parseInt(req.query.paperId as string) : undefined;
      const milestones = await storage.getMilestones(paperId);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const milestone = insertMilestoneSchema.parse(req.body);
      const createdMilestone = await storage.createMilestone(milestone);
      res.status(201).json(createdMilestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertMilestoneSchema.partial().parse(req.body);
      const updatedMilestone = await storage.updateMilestone(id, updates);
      if (!updatedMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json(updatedMilestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  app.put("/api/milestones/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestone = await storage.completeMilestone(id);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete milestone" });
    }
  });

  app.delete("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMilestone(id);
      if (!deleted) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // Notes
  app.get("/api/notes", async (req, res) => {
    try {
      const paperId = req.query.paperId ? parseInt(req.query.paperId as string) : undefined;
      const notes = await storage.getNotes(paperId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const note = insertNoteSchema.parse(req.body);
      const createdNote = await storage.createNote(note);
      res.status(201).json(createdNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertNoteSchema.partial().parse(req.body);
      const updatedNote = await storage.updateNote(id, updates);
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Progress Entries
  app.get("/api/progress", async (req, res) => {
    try {
      const paperId = req.query.paperId ? parseInt(req.query.paperId as string) : undefined;
      const entries = await storage.getProgressEntries(paperId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress entries" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const entry = insertProgressEntrySchema.parse(req.body);
      const createdEntry = await storage.createProgressEntry(entry);
      res.status(201).json(createdEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress entry" });
    }
  });

  app.put("/api/progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertProgressEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateProgressEntry(id, updates);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Progress entry not found" });
      }
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress entry" });
    }
  });

  app.delete("/api/progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProgressEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Progress entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete progress entry" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const papers = await storage.getPapers();
      const milestones = await storage.getMilestones();
      const progressEntries = await storage.getProgressEntries();

      const activePapers = papers.filter(p => p.status !== "completed").length;
      const completedPapers = papers.filter(p => p.status === "completed").length;
      
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueSoon = milestones.filter(m => 
        !m.completed && 
        new Date(m.dueDate) <= oneWeekFromNow
      ).length;

      const totalWords = papers.reduce((sum, paper) => sum + paper.currentWordCount, 0);

      res.json({
        activePapers,
        completedPapers,
        dueSoon,
        totalWords,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
