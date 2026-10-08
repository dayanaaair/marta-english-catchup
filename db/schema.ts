import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const courseProgress = sqliteTable("course_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id").notNull(),
  moduleId: text("module_id").notNull(),
  bestScore: integer("best_score").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  mistakes: text("mistakes").notNull().default("[]"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("student_module_unique").on(table.studentId, table.moduleId)]);
