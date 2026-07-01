import { Router } from "express";
import { db } from "@workspace/db";
import {
  propertiesTable,
  propertyImagesTable,
  propertyAmenitiesTable,
} from "@workspace/db";
import { eq, desc, asc, and, gte, lte, sql, ilike, inArray } from "drizzle-orm";

const router = Router();

function formatProperty(
  p: typeof propertiesTable.$inferSelect,
  images: typeof propertyImagesTable.$inferSelect[],
  amenities: typeof propertyAmenitiesTable.$inferSelect[]
) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    pricePeriod: p.pricePeriod,
    listingType: p.listingType,
    propertyType: p.propertyType,
    status: p.status,
    location: p.location,
    neighborhood: p.neighborhood,
    area: p.area ? Number(p.area) : null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    isVerified: p.isVerified,
    isFeatured: p.isFeatured,
    sellerName: p.sellerName,
    sellerPhone: p.sellerPhone,
    sellerEmail: p.sellerEmail,
    sellerWhatsapp: p.sellerWhatsapp,
    latitude: p.latitude ? Number(p.latitude) : null,
    longitude: p.longitude ? Number(p.longitude) : null,
    viewCount: p.viewCount,
    images: images.map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
    })),
    amenities: amenities.map((a) => a.name),
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /properties
router.get("/properties", async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      bedrooms,
      location,
      isFeatured,
      propertyType,
      page = "1",
      limit = "12",
      sortBy = "newest",
    } = req.query as Record<string, string>;

    const conditions = [];

    if (type && type !== "all") {
      conditions.push(eq(propertiesTable.listingType, type as "sale" | "rent"));
    }
    if (minPrice) {
      conditions.push(gte(propertiesTable.price, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(propertiesTable.price, maxPrice));
    }
    if (bedrooms) {
      conditions.push(eq(propertiesTable.bedrooms, Number(bedrooms)));
    }
    if (location) {
      conditions.push(ilike(propertiesTable.location, `%${location}%`));
    }
    if (isFeatured === "true") {
      conditions.push(eq(propertiesTable.isFeatured, true));
    }
    if (propertyType) {
      conditions.push(ilike(propertiesTable.propertyType, `%${propertyType}%`));
    }
    conditions.push(eq(propertiesTable.status, "active"));

    const whereClause = and(...conditions);

    let orderClause;
    if (sortBy === "price_asc") orderClause = asc(propertiesTable.price);
    else if (sortBy === "price_desc") orderClause = desc(propertiesTable.price);
    else if (sortBy === "oldest") orderClause = asc(propertiesTable.createdAt);
    else orderClause = desc(propertiesTable.createdAt);

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [properties, countResult] = await Promise.all([
      db
        .select()
        .from(propertiesTable)
        .where(whereClause)
        .orderBy(orderClause)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(propertiesTable)
        .where(whereClause),
    ]);

    const propertyIds = properties.map((p) => p.id);
    const [images, amenities] =
      propertyIds.length > 0
        ? await Promise.all([
            db.select().from(propertyImagesTable).where(inArray(propertyImagesTable.propertyId, propertyIds)),
            db.select().from(propertyAmenitiesTable).where(inArray(propertyAmenitiesTable.propertyId, propertyIds)),
          ])
        : [[], []];

    const formatted = properties.map((p) =>
      formatProperty(
        p,
        images.filter((img) => img.propertyId === p.id),
        amenities.filter((a) => a.propertyId === p.id)
      )
    );

    res.json({
      properties: formatted,
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "listProperties error");
    res.status(500).json({ error: "Failed to list properties" });
  }
});

// GET /properties/featured
router.get("/properties/featured", async (req, res) => {
  try {
    const properties = await db
      .select()
      .from(propertiesTable)
      .where(and(eq(propertiesTable.isFeatured, true), eq(propertiesTable.status, "active")))
      .orderBy(desc(propertiesTable.createdAt))
      .limit(8);

    const propertyIds = properties.map((p) => p.id);
    const [images, amenities] =
      propertyIds.length > 0
        ? await Promise.all([
            db.select().from(propertyImagesTable).where(inArray(propertyImagesTable.propertyId, propertyIds)),
            db.select().from(propertyAmenitiesTable).where(inArray(propertyAmenitiesTable.propertyId, propertyIds)),
          ])
        : [[], []];

    res.json(
      properties.map((p) =>
        formatProperty(
          p,
          images.filter((img) => img.propertyId === p.id),
          amenities.filter((a) => a.propertyId === p.id)
        )
      )
    );
  } catch (err) {
    req.log.error({ err }, "getFeaturedProperties error");
    res.status(500).json({ error: "Failed to get featured properties" });
  }
});

// GET /properties/recent
router.get("/properties/recent", async (req, res) => {
  try {
    const properties = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.status, "active"))
      .orderBy(desc(propertiesTable.createdAt))
      .limit(8);

    const propertyIds = properties.map((p) => p.id);
    const [images, amenities] =
      propertyIds.length > 0
        ? await Promise.all([
            db.select().from(propertyImagesTable).where(inArray(propertyImagesTable.propertyId, propertyIds)),
            db.select().from(propertyAmenitiesTable).where(inArray(propertyAmenitiesTable.propertyId, propertyIds)),
          ])
        : [[], []];

    res.json(
      properties.map((p) =>
        formatProperty(
          p,
          images.filter((img) => img.propertyId === p.id),
          amenities.filter((a) => a.propertyId === p.id)
        )
      )
    );
  } catch (err) {
    req.log.error({ err }, "getRecentProperties error");
    res.status(500).json({ error: "Failed to get recent properties" });
  }
});

// GET /properties/summary
router.get("/properties/summary", async (req, res) => {
  try {
    const [total, forSale, forRent, featured, verified, avgSale, avgRent] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(eq(propertiesTable.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(and(eq(propertiesTable.listingType, "sale"), eq(propertiesTable.status, "active"))),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(and(eq(propertiesTable.listingType, "rent"), eq(propertiesTable.status, "active"))),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(and(eq(propertiesTable.isFeatured, true), eq(propertiesTable.status, "active"))),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(and(eq(propertiesTable.isVerified, true), eq(propertiesTable.status, "active"))),
      db.select({ avg: sql<number>`avg(price::numeric)` }).from(propertiesTable).where(and(eq(propertiesTable.listingType, "sale"), eq(propertiesTable.status, "active"))),
      db.select({ avg: sql<number>`avg(price::numeric)` }).from(propertiesTable).where(and(eq(propertiesTable.listingType, "rent"), eq(propertiesTable.status, "active"))),
    ]);

    res.json({
      totalListings: Number(total[0].count),
      forSale: Number(forSale[0].count),
      forRent: Number(forRent[0].count),
      featured: Number(featured[0].count),
      verifiedListings: Number(verified[0].count),
      averageSalePrice: Number(avgSale[0].avg) || 0,
      averageRentPrice: Number(avgRent[0].avg) || 0,
    });
  } catch (err) {
    req.log.error({ err }, "getPropertySummary error");
    res.status(500).json({ error: "Failed to get property summary" });
  }
});

// GET /properties/:id
router.get("/properties/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [property] = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, id));

    if (!property) return res.status(404).json({ error: "Property not found" });

    // Increment view count
    await db
      .update(propertiesTable)
      .set({ viewCount: property.viewCount + 1 })
      .where(eq(propertiesTable.id, id));

    const [images, amenities] = await Promise.all([
      db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, id)),
      db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, id)),
    ]);

    res.json(formatProperty(property, images, amenities));
  } catch (err) {
    req.log.error({ err }, "getProperty error");
    res.status(500).json({ error: "Failed to get property" });
  }
});

// POST /properties
router.post("/properties", async (req, res) => {
  try {
    const { images: imageUrls, amenities: amenityNames, ...propertyData } = req.body;

    const [property] = await db
      .insert(propertiesTable)
      .values({
        ...propertyData,
        price: String(propertyData.price),
      })
      .returning();

    if (imageUrls && imageUrls.length > 0) {
      await db.insert(propertyImagesTable).values(
        imageUrls.map((url: string, i: number) => ({
          propertyId: property.id,
          url,
          isPrimary: i === 0,
        }))
      );
    }

    if (amenityNames && amenityNames.length > 0) {
      await db.insert(propertyAmenitiesTable).values(
        amenityNames.map((name: string) => ({ propertyId: property.id, name }))
      );
    }

    const [images, amenities] = await Promise.all([
      db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, property.id)),
      db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, property.id)),
    ]);

    res.status(201).json(formatProperty(property, images, amenities));
  } catch (err) {
    req.log.error({ err }, "createProperty error");
    res.status(500).json({ error: "Failed to create property" });
  }
});

// PATCH /properties/:id
router.patch("/properties/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { amenities: amenityNames, ...updateData } = req.body;

    if (updateData.price) updateData.price = String(updateData.price);

    const [property] = await db
      .update(propertiesTable)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(propertiesTable.id, id))
      .returning();

    if (!property) return res.status(404).json({ error: "Property not found" });

    if (amenityNames) {
      await db.delete(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, id));
      if (amenityNames.length > 0) {
        await db.insert(propertyAmenitiesTable).values(
          amenityNames.map((name: string) => ({ propertyId: id, name }))
        );
      }
    }

    const [images, amenities] = await Promise.all([
      db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, id)),
      db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, id)),
    ]);

    res.json(formatProperty(property, images, amenities));
  } catch (err) {
    req.log.error({ err }, "updateProperty error");
    res.status(500).json({ error: "Failed to update property" });
  }
});

// DELETE /properties/:id
router.delete("/properties/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteProperty error");
    res.status(500).json({ error: "Failed to delete property" });
  }
});

export default router;
