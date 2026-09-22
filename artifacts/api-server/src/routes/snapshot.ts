import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, mediaTable, snapshotAnswersTable, snapshotsTable } from "@workspace/db";
import { GetSnapshotResponse, SaveSnapshotBody, SaveSnapshotResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

async function readSnapshot() {
  const [snapshot] = await db.select().from(snapshotsTable).orderBy(asc(snapshotsTable.id)).limit(1);
  if (!snapshot) return null;
  const answers = await db.select().from(snapshotAnswersTable).where(eq(snapshotAnswersTable.snapshotId, snapshot.id)).orderBy(asc(snapshotAnswersTable.id));
  const media = await db.select().from(mediaTable).orderBy(asc(mediaTable.id));
  return {
    id: snapshot.id,
    isFinal: snapshot.isFinal,
    completedAt: snapshot.completedAt,
    answers: answers.map((answer) => ({
      questionKey: answer.questionKey,
      questionText: answer.questionText,
      answer: answer.answer,
      media: media.filter((item) => item.snapshotAnswerId === answer.id).map((item) => ({
        id: item.id, section: item.section, originalFilename: item.originalFilename, mimeType: item.mimeType, size: item.fileSize, objectPath: item.objectPath,
      })),
    })),
  };
}

router.get("/snapshot", requireAuth, async (_req, res): Promise<void> => {
  const snapshot = await readSnapshot();
  res.json(GetSnapshotResponse.parse(snapshot));
});

router.post("/snapshot", requireAuth, async (req, res): Promise<void> => {
  const parsed = SaveSnapshotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please answer each question before saving." });
    return;
  }
  const [existing] = await db.select({ id: snapshotsTable.id }).from(snapshotsTable).limit(1);
  if (existing) {
    res.status(409).json({ error: "This snapshot has already been saved." });
    return;
  }
  const result = await db.transaction(async (tx) => {
    const [snapshot] = await tx.insert(snapshotsTable).values({ completedAt: new Date(), isFinal: true }).returning();
    for (const answer of parsed.data.answers) {
      const [savedAnswer] = await tx.insert(snapshotAnswersTable).values({ snapshotId: snapshot.id, questionKey: answer.questionKey, questionText: answer.questionText, answer: answer.answer }).returning();
      if (answer.media?.length) {
        await tx.insert(mediaTable).values(answer.media.map((item) => ({
          snapshotAnswerId: savedAnswer.id,
          section: item.section,
          objectPath: item.objectPath,
          originalFilename: item.originalFilename,
          mimeType: item.mimeType,
          fileSize: item.size,
        })));
      }
    }
    return snapshot;
  });
  const snapshot = await readSnapshot();
  req.log.info({ snapshotId: result.id }, "Saved final snapshot");
  res.status(201).json(SaveSnapshotResponse.parse(snapshot));
});

export default router;