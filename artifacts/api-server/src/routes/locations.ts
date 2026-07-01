import { Router } from "express";
import { db } from "@workspace/db";
import { locationsTable } from "@workspace/db";

const router = Router();

router.get("/locations", async (req, res) => {
  try {
    const locations = await db.select().from(locationsTable);
    res.json(
      locations.map((l) => ({
        id: l.id,
        name: l.name,
        propertyCount: l.propertyCount,
        imageUrl: l.imageUrl,
        description: l.description,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "listLocations error");
    res.status(500).json({ error: "Failed to list locations" });
  }
});

export default router;
