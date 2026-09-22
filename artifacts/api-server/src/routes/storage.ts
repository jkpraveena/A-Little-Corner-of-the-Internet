import { Router, type IRouter } from "express";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { createUploadTarget, getPrivateObject, streamPrivateObject } from "../lib/objectStorage";

const router: IRouter = Router();
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp4"]);
const maxSize = 50 * 1024 * 1024;

router.post("/storage/uploads/request-url", requireAuth, async (req, res): Promise<void> => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success || !allowedTypes.has(parsed.data.contentType) || parsed.data.size > maxSize) {
    res.status(400).json({ error: "That file type or size is not supported." });
    return;
  }
  const target = await createUploadTarget(parsed.data.name);
  res.json(RequestUploadUrlResponse.parse(target));
});

router.get("/storage/objects/{*splat}", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.splat) ? req.params.splat.join("/") : req.params.splat;
  try {
    const response = await streamPrivateObject(await getPrivateObject(`/objects/${raw}`));
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.status(200);
    if (!response.body) { res.end(); return; }
    const reader = response.body.getReader();
    const pump = async (): Promise<void> => {
      const chunk = await reader.read();
      if (chunk.done) { res.end(); return; }
      res.write(Buffer.from(chunk.value));
      await pump();
    };
    await pump();
  } catch {
    res.status(404).json({ error: "Media not found." });
  }
});

export default router;