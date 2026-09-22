import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { Storage, type File } from "@google-cloud/storage";

const SIDECAR = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${SIDECAR}/token`,
    type: "external_account",
    credential_source: { url: `${SIDECAR}/credential`, format: { type: "json", subject_token_field_name: "access_token" } },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

const privateDir = () => {
  const value = process.env.PRIVATE_OBJECT_DIR;
  if (!value) throw new Error("Private object storage is not configured");
  return value.replace(/\/$/, "");
};

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const [empty, bucketName, ...parts] = normalized.split("/");
  if (!bucketName || parts.length === 0) throw new Error("Invalid object path");
  return { bucketName, objectName: parts.join("/") };
}

async function signObjectUrl(bucketName: string, objectName: string, method: "PUT" | "GET"): Promise<string> {
  const response = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Unable to create a private upload URL");
  const body = (await response.json()) as { signed_url: string };
  return body.signed_url;
}

export async function createUploadTarget(filename: string): Promise<{ uploadURL: string; objectPath: string }> {
  const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-80) || "upload";
  const objectPath = `/objects/uploads/${randomUUID()}-${safeName}`;
  const { bucketName, objectName } = parseObjectPath(`${privateDir()}${objectPath.slice("/objects".length)}`);
  return { uploadURL: await signObjectUrl(bucketName, objectName, "PUT"), objectPath };
}

export async function getPrivateObject(objectPath: string): Promise<File> {
  if (!objectPath.startsWith("/objects/")) throw new Error("Invalid object path");
  const { bucketName, objectName } = parseObjectPath(`${privateDir()}${objectPath.slice("/objects".length)}`);
  const file = storage.bucket(bucketName).file(objectName);
  const [exists] = await file.exists();
  if (!exists) throw new Error("Object not found");
  return file;
}

export async function streamPrivateObject(file: File): Promise<Response> {
  const [metadata] = await file.getMetadata();
  const stream = Readable.toWeb(file.createReadStream()) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": metadata.contentType ?? "application/octet-stream",
      "Content-Length": String(metadata.size ?? 0),
      "Cache-Control": "private, max-age=3600",
    },
  });
}