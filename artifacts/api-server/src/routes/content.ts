import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, birthdayMessageTable, finalLetterTable, memoriesTable, openWhenLettersTable, siteConfigTable } from "@workspace/db";
import { GetSiteContentResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { sampleContent } from "../lib/seed-content";

const router: IRouter = Router();

async function ensureContent(): Promise<void> {
  // ─────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────
  const [config] = await db
    .select({ id: siteConfigTable.id })
    .from(siteConfigTable)
    .limit(1);

  if (!config) {
    await db.insert(siteConfigTable).values({
      ...sampleContent.config,
    });
  } else {
    await db
      .update(siteConfigTable)
      .set({
        birthdayPersonName:
          sampleContent.config.birthdayPersonName,
        birthdayDate:
          sampleContent.config.birthdayDate,
        introText:
          sampleContent.config.introText,
      })
      .where(eq(siteConfigTable.id, config.id));
  }

  // ─────────────────────────────────────────────
  // MEMORIES
  // Update existing memories by display order.
  // This preserves their IDs and uploaded images.
  // ─────────────────────────────────────────────
  const existingMemories = await db
    .select()
    .from(memoriesTable)
    .orderBy(asc(memoriesTable.displayOrder));

  if (existingMemories.length === 0) {
    await db
      .insert(memoriesTable)
      .values([...sampleContent.memories]);
  } else {
    for (
      let i = 0;
      i < sampleContent.memories.length;
      i++
    ) {
      const sample =
        sampleContent.memories[i];

      const existing =
        existingMemories[i];

      if (!existing) {
        await db
          .insert(memoriesTable)
          .values({
            ...sample,
            displayOrder: sample.displayOrder,
          });

        continue;
      }

      await db
        .update(memoriesTable)
        .set({
          title: sample.title,
          description: sample.description,
          memoryDate: sample.memoryDate,
          displayOrder: sample.displayOrder,
          imageStorageKey: sample.imageStorageKey,
        })
        .where(
          eq(
            memoriesTable.id,
            existing.id,
          ),
        );
    }
  }

  // ─────────────────────────────────────────────
  // OPEN WHEN LETTERS
  // ─────────────────────────────────────────────
  const existingOpenWhen = await db
    .select()
    .from(openWhenLettersTable)
    .orderBy(
      asc(openWhenLettersTable.displayOrder),
    );

  if (existingOpenWhen.length === 0) {
    await db
      .insert(openWhenLettersTable)
      .values([...sampleContent.openWhen]);
  } else {
    for (
      let i = 0;
      i < sampleContent.openWhen.length;
      i++
    ) {
      const sample =
        sampleContent.openWhen[i];

      const existing =
        existingOpenWhen[i];

      if (!existing) {
        await db
          .insert(openWhenLettersTable)
          .values({
            ...sample,
            displayOrder: i,
          });

        continue;
      }

      await db
        .update(openWhenLettersTable)
        .set({
          title: sample.title,
          message: sample.message,
          displayOrder: i,
        })
        .where(
          eq(
            openWhenLettersTable.id,
            existing.id,
          ),
        );
    }
  }

  // ─────────────────────────────────────────────
  // FINAL LETTER
  // ─────────────────────────────────────────────
  const [finalLetter] = await db
    .select({
      id: finalLetterTable.id,
    })
    .from(finalLetterTable)
    .limit(1);

  if (!finalLetter) {
    await db
      .insert(finalLetterTable)
      .values({
        letter: sampleContent.finalLetter,
      });
  } else {
    await db
      .update(finalLetterTable)
      .set({
        letter: sampleContent.finalLetter,
      })
      .where(
        eq(
          finalLetterTable.id,
          finalLetter.id,
        ),
      );
  }

  // ─────────────────────────────────────────────
  // BIRTHDAY MESSAGE
  // ─────────────────────────────────────────────
  const [message] = await db
    .select({
      id: birthdayMessageTable.id,
    })
    .from(birthdayMessageTable)
    .limit(1);

  if (!message) {
    await db
      .insert(birthdayMessageTable)
      .values({
        message:
          sampleContent.birthdayMessage,
      });
  } else {
    await db
      .update(birthdayMessageTable)
      .set({
        message:
          sampleContent.birthdayMessage,
      })
      .where(
        eq(
          birthdayMessageTable.id,
          message.id,
        ),
      );
  }
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