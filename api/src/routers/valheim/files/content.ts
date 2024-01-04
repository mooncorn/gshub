import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import * as nodePath from "path";
import { FileExplorer } from "../../../lib/file-explorer";
import { BadRequestError } from "../../../lib/exceptions/api/bad-request-error";
import { requireAuth } from "../../../middleware/require-auth";

const router = express.Router();

router.get(
  "/api/valheim/servers/valheim/files/content",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { path } = req.query;

    const serverDirectory = nodePath.join(
      process.cwd(),
      "../server-data/valheim/"
    );

    const fileExplorer = new FileExplorer(serverDirectory);
    const data = await fileExplorer.readFile(String(path ?? ""));
    if (typeof data === "string") {
      // Text-based file, respond with JSON content
      res.json({ content: data });
      return;
    }

    throw new BadRequestError("Cannot read file");
    // Binary file, respond with a downloadable attachment
    // res.setHeader('Content-Type', data.mimeType ?? '');
    // res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    // res.send(data.fileBuffer);
  }
);

export { router as valheimFilesContentRouter };
