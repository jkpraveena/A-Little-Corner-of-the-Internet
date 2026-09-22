import { timingSafeEqual } from "node:crypto";
import { Router, type IRouter } from "express";
import { GetSessionResponse, UnlockBody, UnlockResponse } from "@workspace/api-zod";
import { createSession, destroySession, isAuthenticated } from "../lib/session";

const router: IRouter = Router();

router.get("/auth/session", (_req, res): void => {
  res.json(GetSessionResponse.parse({ authenticated: isAuthenticated(_req) }));
});

router.post("/auth/unlock", (req, res): void => {
  const parsed = UnlockBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a password to unlock this space." });
    return;
  }
  const expected = process.env.BIRTHDAY_PASSWORD;
  const actual = Buffer.from(parsed.data.password);
  const target = Buffer.from(expected ?? "");
  const valid = Boolean(expected) && actual.length === target.length && timingSafeEqual(actual, target);
  if (!valid) {
    res.status(401).json({ error: "Not quite. Try again." });
    return;
  }
  createSession(res);
  res.json(UnlockResponse.parse({ authenticated: true }));
});

router.post("/auth/logout", (req, res): void => {
  destroySession(req, res);
  res.sendStatus(204);
});

export default router;