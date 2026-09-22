import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, futureLettersTable, siteConfigTable } from "@workspace/db";
import { GetFutureLetterResponse, SaveFutureLetterBody, SaveFutureLetterResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

async function readLetter() {
  const [letter] = await db.select().from(futureLettersTable).orderBy(asc(futureLettersTable.id)).limit(1);
  if (!letter) return null;
  return { id: letter.id, letter: letter.letter, targetDate: letter.targetDate, isFinal: letter.isFinal };
}

router.get("/future-letter", requireAuth, async (_req, res): Promise<void> => {
  res.json(GetFutureLetterResponse.parse(await readLetter()));
});

router.post("/future-letter", requireAuth, async (req, res): Promise<void> => {
  const parsed = SaveFutureLetterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Write a little something before saving." });
    return;
  }
  const [existing] = await db.select({ id: futureLettersTable.id }).from(futureLettersTable).limit(1);
  if (existing) {
    res.status(409).json({ error: "Your future letter is already waiting." });
    return;
  }
  const [config] = await db.select().from(siteConfigTable).orderBy(asc(siteConfigTable.id)).limit(1);
  const birthday = config?.birthdayDate ?? "2026-09-23";
  const now = new Date();
  const target = new Date(`${birthday}T00:00:00`);
  if (target <= now) target.setFullYear(target.getFullYear() + 1);
  const targetDate = target.toISOString().slice(0, 10);
  const [letter] = await db.insert(futureLettersTable).values({ letter: parsed.data.letter, targetDate, isFinal: true }).returning();
  req.log.info({ letterId: letter.id }, "Saved future letter");
  res.status(201).json(SaveFutureLetterResponse.parse({ id: letter.id, letter: letter.letter, targetDate: letter.targetDate, isFinal: letter.isFinal }));
});

export default router;