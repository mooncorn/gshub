import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { FileExplorer } from "../../../lib/files/file-explorer";
import { env } from "../../../lib/env";

const router = express.Router();

router.get(
  "/volumes",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const fileExplorer = new FileExplorer(env.CONTAINERS_DIR);

    const files = await fileExplorer.listFilesAndFolders();

    res.json({ files });
  }
);

export { router as volumesListRouter };
