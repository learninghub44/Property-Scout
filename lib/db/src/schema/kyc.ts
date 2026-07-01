import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kycStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected", "suspended"]);
export const idTypeEnum = pgEnum("id_type", ["national_id", "passport"]);

export const kycVerificationsTable = pgTable("kyc_verifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: kycStatusEnum("status").notNull().default("pending"),
  idType: idTypeEnum("id_type"),
  idNumber: text("id_number"),
  address: text("address"),
  selfieUrl: text("selfie_url"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKycSchema = createInsertSchema(kycVerificationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type KycVerification = typeof kycVerificationsTable.$inferSelect;
