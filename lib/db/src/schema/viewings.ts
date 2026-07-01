import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { propertiesTable } from "./properties";

export const viewingStatusEnum = pgEnum("viewing_status", ["pending", "confirmed", "cancelled", "completed"]);

export const viewingRequestsTable = pgTable("viewing_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => propertiesTable.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: viewingStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email").notNull(),
  requesterPhone: text("requester_phone").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertViewingSchema = createInsertSchema(viewingRequestsTable).omit({ id: true, createdAt: true });
export type InsertViewing = z.infer<typeof insertViewingSchema>;
export type ViewingRequest = typeof viewingRequestsTable.$inferSelect;
