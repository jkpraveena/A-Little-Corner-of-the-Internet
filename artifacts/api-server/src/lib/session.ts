import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SESSION_COOKIE = "birthday_session";
const sessions = new Map<string, { createdAt: number }>();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

export function createSession(res: Response): void {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { createdAt: Date.now() });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function destroySession(req: Request, res: Response): void {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (token) sessions.delete(token);
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
}

export function isAuthenticated(req: Request): boolean {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}