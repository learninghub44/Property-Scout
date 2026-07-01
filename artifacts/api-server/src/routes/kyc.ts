import { Router } from "express";
import { db } from "@workspace/db";
import { kycVerificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_USER_ID = "guest";

router.get("/kyc", async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID;
    const [kyc] = await db.select().from(kycVerificationsTable).where(eq(kycVerificationsTable.userId, userId));
    if (!kyc) return res.status(404).json({ error: "No KYC record found" });

    res.json({
      id: kyc.id,
      status: kyc.status,
      idType: kyc.idType,
      idNumber: kyc.idNumber,
      address: kyc.address,
      rejectionReason: kyc.rejectionReason,
      createdAt: kyc.createdAt.toISOString(),
      updatedAt: kyc.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "getKycStatus error");
    res.status(500).json({ error: "Failed to get KYC status" });
  }
});

router.post("/kyc", async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID;
    const { idType, idNumber, address, selfieUrl } = req.body;

    const [kyc] = await db
      .insert(kycVerificationsTable)
      .values({ userId, idType, idNumber, address, selfieUrl, status: "pending" })
      .returning();

    res.status(201).json({
      id: kyc.id,
      status: kyc.status,
      idType: kyc.idType,
      idNumber: kyc.idNumber,
      address: kyc.address,
      rejectionReason: kyc.rejectionReason,
      createdAt: kyc.createdAt.toISOString(),
      updatedAt: kyc.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "submitKyc error");
    res.status(500).json({ error: "Failed to submit KYC" });
  }
});

export default router;
