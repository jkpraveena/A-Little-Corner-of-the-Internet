import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, birthdayMessageTable, finalLetterTable, memoriesTable, openWhenLettersTable, siteConfigTable } from "@workspace/db";
import { GetSiteContentResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { sampleContent } from "../lib/seed-content";

const router: IRouter = Router();

async function ensureContent(): Promise<void> {
  const [config] = await db.select({ id: siteConfigTable.id }).from(siteConfigTable).limit(1);
  if (!config) {
    await db.insert(siteConfigTable).values({
      ...sampleContent.config,
    });
  }
  const [memory] = await db.select({ id: memoriesTable.id }).from(memoriesTable).limit(1);
  if (!memory) {
    await db.insert(memoriesTable).values([...sampleContent.memories]);
  }
  const [letter] = await db.select({ id: openWhenLettersTable.id }).from(openWhenLettersTable).limit(1);
  if (!letter) {
    await db.insert(openWhenLettersTable).values([...sampleContent.openWhen]);
  }
  const [finalLetter] = await db.select({ id: finalLetterTable.id }).from(finalLetterTable).limit(1);
  if (!finalLetter) {
    await db.insert(finalLetterTable).values({ letter: sampleContent.finalLetter });
  }
  const [message] = await db.select({ id: birthdayMessageTable.id }).from(birthdayMessageTable).limit(1);
  if (!message) await db.insert(birthdayMessageTable).values({ message: sampleContent.birthdayMessage });
}

router.get("/content", requireAuth, async (req, res): Promise<void> => {
  await ensureContent();
  const [config] = await db.select().from(siteConfigTable).orderBy(asc(siteConfigTable.id)).limit(1);
  const memories = await db.select().from(memoriesTable).orderBy(asc(memoriesTable.displayOrder));
  const openWhen = await db.select().from(openWhenLettersTable).orderBy(asc(openWhenLettersTable.displayOrder));
  const [finalLetter] = await db.select().from(finalLetterTable).orderBy(asc(finalLetterTable.id)).limit(1);
  const [birthdayMessage] = await db.select().from(birthdayMessageTable).orderBy(asc(birthdayMessageTable.id)).limit(1);
  const data = {
    config: { personName: config.birthdayPersonName, birthdayDate: config.birthdayDate, introText: config.introText },
    memories: memories.map((item) => ({ id: item.id, title: item.title, description: item.description, imageUrl: item.imageStorageKey ? `/api/storage/objects${item.imageStorageKey.replace("/objects", "")}` : null, memoryDate: item.memoryDate, displayOrder: item.displayOrder })),
    openWhen: openWhen.map((item) => ({ id: item.id, title: item.title, message: item.message, displayOrder: item.displayOrder })),
    finalLetter: finalLetter?.letter ?? "",
    birthdayMessage: birthdayMessage?.message ?? "",
  };
  req.log.info("Loaded private birthday content");
  res.json(GetSiteContentResponse.parse(data));
});

export default router;