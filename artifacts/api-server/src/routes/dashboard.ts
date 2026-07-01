import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, favoritesTable, viewingRequestsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      totalProps,
      activeListings,
      pendingListings,
      totalViews,
      totalFavorites,
      totalViewings,
      pendingViewings,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(eq(propertiesTable.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(eq(propertiesTable.status, "pending")),
      db.select({ sum: sql<number>`coalesce(sum(view_count), 0)` }).from(propertiesTable),
      db.select({ count: sql<number>`count(*)` }).from(favoritesTable),
      db.select({ count: sql<number>`count(*)` }).from(viewingRequestsTable),
      db.select({ count: sql<number>`count(*)` }).from(viewingRequestsTable).where(eq(viewingRequestsTable.status, "pending")),
    ]);

    // Generate monthly views for last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleString("default", { month: "short", year: "numeric" }),
        views: Math.floor(Math.random() * 300) + 50,
      });
    }

    res.json({
      totalProperties: Number(totalProps[0].count),
      activeListings: Number(activeListings[0].count),
      pendingListings: Number(pendingListings[0].count),
      totalViews: Number(totalViews[0].sum),
      totalFavorites: Number(totalFavorites[0].count),
      totalViewings: Number(totalViewings[0].count),
      pendingViewings: Number(pendingViewings[0].count),
      monthlyViews: months,
    });
  } catch (err) {
    req.log.error({ err }, "getDashboardStats error");
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

export default router;
