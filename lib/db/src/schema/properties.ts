import { pgTable, serial, text, integer, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingTypeEnum = pgEnum("listing_type", ["sale", "rent"]);
export const propertyStatusEnum = pgEnum("property_status", ["active", "pending", "sold", "rented", "inactive"]);
export const pricePeriodEnum = pgEnum("price_period", ["per_month", "per_year", "total"]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  pricePeriod: pricePeriodEnum("price_period").notNull().default("total"),
  listingType: listingTypeEnum("listing_type").notNull(),
  propertyType: text("property_type").notNull(),
  status: propertyStatusEnum("status").notNull().default("active"),
  location: text("location").notNull(),
  neighborhood: text("neighborhood").notNull(),
  area: numeric("area", { precision: 10, scale: 2 }),
  bedrooms: integer("bedrooms").notNull().default(0),
  bathrooms: integer("bathrooms").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  sellerName: text("seller_name"),
  sellerPhone: text("seller_phone"),
  sellerEmail: text("seller_email"),
  sellerWhatsapp: text("seller_whatsapp"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const propertyImagesTable = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => propertiesTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const propertyAmenitiesTable = pgTable("property_amenities", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => propertiesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
export type PropertyImage = typeof propertyImagesTable.$inferSelect;
export type PropertyAmenity = typeof propertyAmenitiesTable.$inferSelect;
