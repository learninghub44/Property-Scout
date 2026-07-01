import { Router } from "express";
import { db } from "@workspace/db";
import { viewingRequestsTable, propertiesTable, propertyImagesTable, propertyAmenitiesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

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
    images: images.map((img: any) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })),
    amenities: amenities.map((a: any) => a.name),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/viewings", async (req, res) => {
  try {
    const viewings = await db.select().from(viewingRequestsTable).orderBy(viewingRequestsTable.createdAt);
    if (viewings.length === 0) return res.json([]);

    const propertyIds = [...new Set(viewings.map((v) => v.propertyId))];
    const [properties, images, amenities] = await Promise.all([
      db.select().from(propertiesTable).where(sql`${propertiesTable.id} = ANY(${propertyIds}::int[])`),
      db.select().from(propertyImagesTable).where(sql`${propertyImagesTable.propertyId} = ANY(${propertyIds}::int[])`),
      db.select().from(propertyAmenitiesTable).where(sql`${propertyAmenitiesTable.propertyId} = ANY(${propertyIds}::int[])`),
    ]);

    const result = viewings.map((v) => {
      const property = properties.find((p) => p.id === v.propertyId);
      return {
        id: v.id,
        propertyId: v.propertyId,
        scheduledAt: v.scheduledAt.toISOString(),
        status: v.status,
        message: v.message,
        requesterName: v.requesterName,
        requesterEmail: v.requesterEmail,
        requesterPhone: v.requesterPhone,
        createdAt: v.createdAt.toISOString(),
        property: property
          ? formatProperty(property, images.filter((img) => img.propertyId === property.id), amenities.filter((a) => a.propertyId === property.id))
          : null,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "listViewings error");
    res.status(500).json({ error: "Failed to list viewings" });
  }
});

router.post("/viewings", async (req, res) => {
  try {
    const { propertyId, scheduledAt, message, requesterName, requesterEmail, requesterPhone } = req.body;

    const [viewing] = await db
      .insert(viewingRequestsTable)
      .values({ propertyId, scheduledAt: new Date(scheduledAt), message, requesterName, requesterEmail, requesterPhone })
      .returning();

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, propertyId));
    const images = await db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, propertyId));
    const amenities = await db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, propertyId));

    res.status(201).json({
      id: viewing.id,
      propertyId: viewing.propertyId,
      scheduledAt: viewing.scheduledAt.toISOString(),
      status: viewing.status,
      message: viewing.message,
      requesterName: viewing.requesterName,
      requesterEmail: viewing.requesterEmail,
      requesterPhone: viewing.requesterPhone,
      createdAt: viewing.createdAt.toISOString(),
      property: property ? formatProperty(property, images, amenities) : null,
    });
  } catch (err) {
    req.log.error({ err }, "createViewing error");
    res.status(500).json({ error: "Failed to create viewing" });
  }
});

router.patch("/viewings/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, scheduledAt } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);

    const [viewing] = await db
      .update(viewingRequestsTable)
      .set(updateData)
      .where(eq(viewingRequestsTable.id, id))
      .returning();

    if (!viewing) return res.status(404).json({ error: "Viewing not found" });

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, viewing.propertyId));
    const images = await db.select().from(propertyImagesTable).where(eq(propertyImagesTable.propertyId, viewing.propertyId));
    const amenities = await db.select().from(propertyAmenitiesTable).where(eq(propertyAmenitiesTable.propertyId, viewing.propertyId));

    res.json({
      id: viewing.id,
      propertyId: viewing.propertyId,
      scheduledAt: viewing.scheduledAt.toISOString(),
      status: viewing.status,
      message: viewing.message,
      requesterName: viewing.requesterName,
      requesterEmail: viewing.requesterEmail,
      requesterPhone: viewing.requesterPhone,
      createdAt: viewing.createdAt.toISOString(),
      property: property ? formatProperty(property, images, amenities) : null,
    });
  } catch (err) {
    req.log.error({ err }, "updateViewing error");
    res.status(500).json({ error: "Failed to update viewing" });
  }
});

export default router;
