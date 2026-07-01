import { Router } from "express";
import { db } from "@workspace/db";
import { favoritesTable, propertiesTable, propertyImagesTable, propertyAmenitiesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

const DEFAULT_USER_ID = "guest";

function formatProperty(p: any, images: any[], amenities: any[]) {
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
    images: images.map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })),
    amenities: amenities.map((a) => a.name),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/favorites", async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID;
    const favs = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    if (favs.length === 0) return res.json([]);

    const propertyIds = favs.map((f) => f.propertyId);
    const [properties, images, amenities] = await Promise.all([
      db.select().from(propertiesTable).where(sql`${propertiesTable.id} = ANY(${propertyIds}::int[])`),
      db.select().from(propertyImagesTable).where(sql`${propertyImagesTable.propertyId} = ANY(${propertyIds}::int[])`),
      db.select().from(propertyAmenitiesTable).where(sql`${propertyAmenitiesTable.propertyId} = ANY(${propertyIds}::int[])`),
    ]);

    const result = favs.map((f) => {
      const property = properties.find((p) => p.id === f.propertyId);
      if (!property) return null;
      return {
        id: f.id,
        propertyId: f.propertyId,
        createdAt: f.createdAt.toISOString(),
        property: formatProperty(
          property,
          images.filter((img) => img.propertyId === property.id),
          amenities.filter((a) => a.propertyId === property.id)
        ),
      };
    }).filter(Boolean);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "listFavorites error");
    res.status(500).json({ error: "Failed to list favorites" });
  }
});

router.post("/favorites", async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID;
    const { propertyId } = req.body;

    const [fav] = await db
      .insert(favoritesTable)
      .values({ userId, propertyId })
      .onConflictDoNothing()
      .returning();

    if (!fav) {
      const existing = await db.select().from(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, propertyId)));
      const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, propertyId));
      const images = await db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, propertyId));
      const amenities = await db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, propertyId));
      return res.status(201).json({ id: existing[0].id, propertyId, createdAt: existing[0].createdAt.toISOString(), property: formatProperty(property, images, amenities) });
    }

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, propertyId));
    const images = await db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, propertyId));
    const amenities = await db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, propertyId));

    res.status(201).json({ id: fav.id, propertyId, createdAt: fav.createdAt.toISOString(), property: formatProperty(property, images, amenities) });
  } catch (err) {
    req.log.error({ err }, "addFavorite error");
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/favorites/:propertyId", async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID;
    const propertyId = Number(req.params.propertyId);
    await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, propertyId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "removeFavorite error");
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;
