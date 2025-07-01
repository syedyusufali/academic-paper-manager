import { 
  papers, 
  milestones, 
  notes, 
  progressEntries,
  type Paper, 
  type InsertPaper,
  type Milestone,
  type InsertMilestone,
  type Note,
  type InsertNote,
  type ProgressEntry,
  type InsertProgressEntry
} from "@shared/schema";

export interface IStorage {
  // Papers
  getPapers(): Promise<Paper[]>;
  getPaper(id: number): Promise<Paper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaper(id: number, paper: Partial<InsertPaper>): Promise<Paper | undefined>;
  deletePaper(id: number): Promise<boolean>;
  updatePaperProgress(id: number, wordCount: number): Promise<Paper | undefined>;

  // Milestones
  getMilestones(paperId?: number): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<boolean>;
  completeMilestone(id: number): Promise<Milestone | undefined>;

  // Notes
  getNotes(paperId?: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;

  // Progress Entries
  getProgressEntries(paperId?: number): Promise<ProgressEntry[]>;
  getProgressEntry(id: number): Promise<ProgressEntry | undefined>;
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  updateProgressEntry(id: number, entry: Partial<InsertProgressEntry>): Promise<ProgressEntry | undefined>;
  deleteProgressEntry(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private papers: Map<number, Paper>;
  private milestones: Map<number, Milestone>;
  private notes: Map<number, Note>;
  private progressEntries: Map<number, ProgressEntry>;
  private currentIds: { paper: number; milestone: number; note: number; progress: number };

  constructor() {
    this.papers = new Map();
    this.milestones = new Map();
    this.notes = new Map();
    this.progressEntries = new Map();
    this.currentIds = { paper: 1, milestone: 1, note: 1, progress: 1 };
  }

  // Papers
  async getPapers(): Promise<Paper[]> {
    return Array.from(this.papers.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getPaper(id: number): Promise<Paper | undefined> {
    return this.papers.get(id);
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = this.currentIds.paper++;
    const now = new Date();
    const paper: Paper = {
      ...insertPaper,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.papers.set(id, paper);
    return paper;
  }

  async updatePaper(id: number, updates: Partial<InsertPaper>): Promise<Paper | undefined> {
    const paper = this.papers.get(id);
    if (!paper) return undefined;
    
    const updatedPaper: Paper = {
      ...paper,
      ...updates,
      updatedAt: new Date(),
    };
    this.papers.set(id, updatedPaper);
    return updatedPaper;
  }

  async deletePaper(id: number): Promise<boolean> {
    const deleted = this.papers.delete(id);
    if (deleted) {
      // Delete associated milestones, notes, and progress entries
      for (const [milestoneId, milestone] of this.milestones) {
        if (milestone.paperId === id) {
          this.milestones.delete(milestoneId);
        }
      }
      for (const [noteId, note] of this.notes) {
        if (note.paperId === id) {
          this.notes.delete(noteId);
        }
      }
      for (const [progressId, progress] of this.progressEntries) {
        if (progress.paperId === id) {
          this.progressEntries.delete(progressId);
        }
      }
    }
    return deleted;
  }

  async updatePaperProgress(id: number, wordCount: number): Promise<Paper | undefined> {
    return this.updatePaper(id, { currentWordCount: wordCount });
  }

  // Milestones
  async getMilestones(paperId?: number): Promise<Milestone[]> {
    const allMilestones = Array.from(this.milestones.values());
    const filtered = paperId ? allMilestones.filter(m => m.paperId === paperId) : allMilestones;
    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.currentIds.milestone++;
    const milestone: Milestone = {
      ...insertMilestone,
      id,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;
    
    const updatedMilestone: Milestone = {
      ...milestone,
      ...updates,
    };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    return this.milestones.delete(id);
  }

  async completeMilestone(id: number): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;
    
    const updatedMilestone: Milestone = {
      ...milestone,
      completed: true,
      completedAt: new Date(),
    };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  // Notes
  async getNotes(paperId?: number): Promise<Note[]> {
    const allNotes = Array.from(this.notes.values());
    const filtered = paperId ? allNotes.filter(n => n.paperId === paperId) : allNotes;
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentIds.note++;
    const now = new Date();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updates: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: new Date(),
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Progress Entries
  async getProgressEntries(paperId?: number): Promise<ProgressEntry[]> {
    const allEntries = Array.from(this.progressEntries.values());
    const filtered = paperId ? allEntries.filter(p => p.paperId === paperId) : allEntries;
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getProgressEntry(id: number): Promise<ProgressEntry | undefined> {
    return this.progressEntries.get(id);
  }

  async createProgressEntry(insertEntry: InsertProgressEntry): Promise<ProgressEntry> {
    const id = this.currentIds.progress++;
    const entry: ProgressEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };
    this.progressEntries.set(id, entry);
    
    // Update paper word count
    const paper = this.papers.get(insertEntry.paperId);
    if (paper) {
      const updatedWordCount = paper.currentWordCount + insertEntry.wordsWritten;
      await this.updatePaperProgress(insertEntry.paperId, updatedWordCount);
    }
    
    return entry;
  }

  async updateProgressEntry(id: number, updates: Partial<InsertProgressEntry>): Promise<ProgressEntry | undefined> {
    const entry = this.progressEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry: ProgressEntry = {
      ...entry,
      ...updates,
    };
    this.progressEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteProgressEntry(id: number): Promise<boolean> {
    return this.progressEntries.delete(id);
  }
}

export const storage = new MemStorage();
