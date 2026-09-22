import { Router, type IRouter } from "express";

import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from "@workspace/api-zod";

import { requireAuth } from "../lib/session";

import {
  createUploadTarget,
  getPrivateObject,
  saveUploadedObject,
  streamPrivateObject,
} from "../lib/objectStorage";

const router: IRouter = Router();

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
  "audio/x-m4a",
  "audio/mp4",
]);

const maxSize = 50 * 1024 * 1024;

/**
 * STEP 1
 *
 * Frontend asks for an upload URL.
 */
router.post(
  "/storage/uploads/request-url",
  requireAuth,
  async (req, res): Promise<void> => {
    try {
      const parsed =
        RequestUploadUrlBody.safeParse(req.body);

      if (!parsed.success) {
        console.error(
          "Invalid upload request:",
          parsed.error,
        );

        res.status(400).json({
          error: "Invalid upload request.",
        });

        return;
      }

      const {
        name,
        contentType,
        size,
      } = parsed.data;

      if (!allowedTypes.has(contentType)) {
        res.status(400).json({
          error:
            "That file type is not supported.",
        });

        return;
      }

      if (size > maxSize) {
        res.status(400).json({
          error:
            "That file is too large. Maximum size is 50 MB.",
        });

        return;
      }

      const target =
        await createUploadTarget(name);

      const response =
        RequestUploadUrlResponse.parse(target);

      res.status(200).json(response);
    } catch (error) {
      console.error(
        "Failed to create upload target:",
        error,
      );

      res.status(500).json({
        error:
          "Unable to create upload target.",
      });
    }
  },
);

/**
 * STEP 2
 *
 * Frontend uploads the actual file here.
 */
router.put(
  "/storage/uploads/:filename",
  requireAuth,
  async (req, res): Promise<void> => {
    try {
      const filename = req.params.filename;

      if (
        !filename ||
        filename.includes("/") ||
        filename.includes("\\") ||
        filename.includes("..")
      ) {
        res.status(400).json({
          error: "Invalid filename.",
        });

        return;
      }

      const chunks: Buffer[] = [];
      let totalSize = 0;

      for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk);

        totalSize += buffer.length;

        if (totalSize > maxSize) {
          res.status(413).json({
            error:
              "File is too large. Maximum size is 50 MB.",
          });

          return;
        }

        chunks.push(buffer);
      }

      const fileData = Buffer.concat(chunks);

      await saveUploadedObject(
        filename,
        fileData,
      );

      res.status(200).json({
        ok: true,
      });
    } catch (error) {
      console.error(
        "Upload failed:",
        error,
      );

      res.status(500).json({
        error:
          "Unable to save uploaded file.",
      });
    }
  },
);

/**
 * STEP 3
 *
 * Frontend requests an uploaded image/video/audio.
 */
router.get(
  "/storage/objects/{*splat}",
  async (req, res): Promise<void> => {
    const raw = Array.isArray(
      req.params.splat,
    )
      ? req.params.splat.join("/")
      : req.params.splat;

    try {
      const objectPath =
        `/objects/${raw}`;

      const filePath =
        await getPrivateObject(
          objectPath,
        );

      const response =
        await streamPrivateObject(
          filePath,
        );

      response.headers.forEach(
        (value, key) => {
          res.setHeader(key, value);
        },
      );

      res.status(200);

      if (!response.body) {
        res.end();
        return;
      }

      const reader =
        response.body.getReader();

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        if (value) {
          res.write(
            Buffer.from(value),
          );
        }
      }

      res.end();
    } catch (error) {
      console.error(
        "Media retrieval failed:",
        error,
      );

      res.status(404).json({
        error: "Media not found.",
      });
    }
  },
);

export default router;