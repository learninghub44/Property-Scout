import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await db
      .select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.isApproved, true))
      .orderBy(testimonialsTable.createdAt);

    res.json(
      testimonials.map((t) => ({
        id: t.id,
        content: t.content,
        rating: t.rating,
        authorName: t.authorName,
        authorRole: t.authorRole,
        avatarUrl: t.avatarUrl,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "listTestimonials error");
    res.status(500).json({ error: "Failed to list testimonials" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const { content, rating } = req.body;

    const [testimonial] = await db
      .insert(testimonialsTable)
      .values({ content, rating, authorName: "Anonymous", isApproved: false })
      .returning();

    res.status(201).json({
      id: testimonial.id,
      content: testimonial.content,
      rating: testimonial.rating,
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole,
      avatarUrl: testimonial.avatarUrl,
      createdAt: testimonial.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "createTestimonial error");
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

export default router;
