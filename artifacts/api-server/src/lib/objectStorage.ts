import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

const uploadsDir = path.resolve(
  process.cwd(),
  "data/uploads",
);

function ensureUploadsDir(): void {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function getFilePath(filename: string): string {
  return path.join(uploadsDir, filename);
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

export async function createUploadTarget(
  filename: string,
): Promise<{
  uploadURL: string;
  objectPath: string;
}> {
  ensureUploadsDir();

  const safeName = sanitizeFilename(filename);

  const storedName =
    `${randomUUID()}-${safeName}`;

  return {
    uploadURL:
      `/api/storage/uploads/${encodeURIComponent(storedName)}`,
    objectPath:
      `/objects/uploads/${storedName}`,
  };
}

export async function saveUploadedObject(
  filename: string,
  data: Buffer,
): Promise<void> {
  ensureUploadsDir();

  const safeName = path.basename(filename);

  const filePath =
    getFilePath(safeName);

  await fs.promises.writeFile(
    filePath,
    data,
  );
}

export async function getPrivateObject(
  objectPath: string,
): Promise<string> {
  console.log("📂 Requested object:", objectPath);
  console.log("📂 Upload directory:", uploadsDir);

  if (
    !objectPath.startsWith(
      "/objects/uploads/",
    )
  ) {
    throw new Error(
      `Invalid object path: ${objectPath}`,
    );
  }

  const filename =
    objectPath.substring(
      "/objects/uploads/".length,
    );

  const safeName =
    path.basename(filename);

  const filePath =
    getFilePath(safeName);

  console.log("📄 Looking for:", filePath);

  try {
    await fs.promises.access(
      filePath,
      fs.constants.R_OK,
    );
  } catch {
    throw new Error(
      `File not found: ${filePath}`,
    );
  }

  return filePath;
}

export async function streamPrivateObject(
  filePath: string,
): Promise<Response> {
  const stats =
    await fs.promises.stat(filePath);

  const extension =
    path.extname(filePath).toLowerCase();

  const contentTypes: Record<
    string,
    string
  > = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
  };

  const contentType =
    contentTypes[extension] ??
    "application/octet-stream";

  const stream = Readable.toWeb(
    fs.createReadStream(filePath),
  ) as ReadableStream;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length":
        String(stats.size),
      "Cache-Control":
        "private, max-age=3600",
    },
  });
}