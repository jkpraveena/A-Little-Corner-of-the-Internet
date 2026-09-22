import { createInsertSchema } from "drizzle-zod";
import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const siteConfigTable = pgTable("site_config", {
  id: serial("id").primaryKey(),
  birthdayPersonName: text("birthday_person_name").notNull(),
  birthdayDate: date("birthday_date", { mode: "string" }).notNull(),
  introText: text("intro_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const snapshotsTable = pgTable("snapshots", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  isFinal: boolean("is_final").notNull().default(true),
});

export const snapshotAnswersTable = pgTable("snapshot_answers", {
  id: serial("id").primaryKey(),
  snapshotId: integer("snapshot_id").notNull().references(() => snapshotsTable.id, { onDelete: "cascade" }),
  questionKey: text("question_key").notNull(),
  questionText: text("question_text").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaTable = pgTable("media", {
  id: serial("id").primaryKey(),
  snapshotAnswerId: integer("snapshot_answer_id").references(() => snapshotAnswersTable.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  objectPath: text("object_path").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const futureLettersTable = pgTable("future_letters", {
  id: serial("id").primaryKey(),
  letter: text("letter").notNull(),
  targetDate: date("target_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  isFinal: boolean("is_final").notNull().default(true),
});

export const memoriesTable = pgTable("memories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageStorageKey: text("image_storage_key"),
  memoryDate: date("memory_date", { mode: "string" }),
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const openWhenLettersTable = pgTable("open_when_letters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const finalLetterTable = pgTable("final_letter", {
  id: serial("id").primaryKey(),
  letter: text("letter").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const birthdayMessageTable = pgTable("birthday_message", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSiteConfigSchema = createInsertSchema(siteConfigTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSnapshotSchema = createInsertSchema(snapshotsTable).omit({ id: true, createdAt: true });
export const insertSnapshotAnswerSchema = createInsertSchema(snapshotAnswersTable).omit({ id: true, createdAt: true });
export const insertMediaSchema = createInsertSchema(mediaTable).omit({ id: true, createdAt: true });
export const insertFutureLetterSchema = createInsertSchema(futureLettersTable).omit({ id: true, createdAt: true });
export const insertMemorySchema = createInsertSchema(memoriesTable).omit({ id: true, createdAt: true });
export const insertOpenWhenLetterSchema = createInsertSchema(openWhenLettersTable).omit({ id: true, createdAt: true });
export const insertFinalLetterSchema = createInsertSchema(finalLetterTable).omit({ id: true, createdAt: true });
export const insertBirthdayMessageSchema = createInsertSchema(birthdayMessageTable).omit({ id: true, createdAt: true });

export type SiteConfig = typeof siteConfigTable.$inferSelect;
export type Snapshot = typeof snapshotsTable.$inferSelect;
export type SnapshotAnswer = typeof snapshotAnswersTable.$inferSelect;
export type Media = typeof mediaTable.$inferSelect;
export type FutureLetter = typeof futureLettersTable.$inferSelect;
export type Memory = typeof memoriesTable.$inferSelect;
export type OpenWhenLetter = typeof openWhenLettersTable.$inferSelect;
export type FinalLetter = typeof finalLetterTable.$inferSelect;
export type BirthdayMessage = typeof birthdayMessageTable.$inferSelect;
export type InsertSnapshotAnswer = z.infer<typeof insertSnapshotAnswerSchema>;