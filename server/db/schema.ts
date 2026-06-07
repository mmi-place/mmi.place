import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const publicSchema = pgSchema("public");

export const channels = publicSchema.table("channels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
});

export const academicGroups = publicSchema.table("academic_groups", {
  id: serial("id").primaryKey(),
  yearCode: text("year_code").notNull(),
  yearLabel: text("year_label").notNull(),
  studyYear: integer("study_year").notNull(),
  groupCode: text("group_code").notNull(),
  groupLabel: text("group_label").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const tools = publicSchema.table("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  source: text("source"),
  description: text("description"),
  emoji: text("emoji"),
  icon: text("icon"),
});

export const messages = publicSchema.table("messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  channelId: integer("channel_id")
    .notNull()
    .references(() => channels.id),
  buttons: jsonb("buttons").$type<MessageButton[]>().notNull().default([]),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  publishAt: timestamp("publish_at", {
    withTimezone: true,
    mode: "date",
  }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const planning = publicSchema.table("planning", {
  id: serial("id").primaryKey(),
  startAt: timestamp("start_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  endAt: timestamp("end_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  module: text("module").notNull(),
  summary: text("summary").notNull(),
  location: text("location").notNull(),
  teachers: text("teachers").array().notNull().default([]),
  groupName: text("group_name").notNull(),
});

export const tasks = publicSchema.table("tasks", {
  id: serial("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  groups: text("groups").array().notNull().default([]),
  files: jsonb("files").$type<unknown[]>().notNull().default([]),
  expected: jsonb("expected").$type<unknown[]>().notNull().default([]),
  date: text("date"),
  deadline: text("deadline"),
});

export type MessageButton = {
  label: string;
  link: string;
  style: string;
};

export type ChannelRow = InferSelectModel<typeof channels>;
export type AcademicGroupRow = InferSelectModel<typeof academicGroups>;
export type ToolRow = InferSelectModel<typeof tools>;
export type MessageRow = InferSelectModel<typeof messages>;
export type PlanningRow = InferSelectModel<typeof planning>;
export type TaskRow = InferSelectModel<typeof tasks>;

export type ToolInsert = InferInsertModel<typeof tools>;
export type MessageInsert = InferInsertModel<typeof messages>;
export type PlanningInsert = InferInsertModel<typeof planning>;
export type TaskInsert = InferInsertModel<typeof tasks>;
