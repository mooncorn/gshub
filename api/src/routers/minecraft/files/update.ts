import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { FileExplorer } from '../../../lib/file-explorer';
import * as nodePath from 'path';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';
import { requireAdmin } from '../../../middleware/require-admin';

const router = express.Router();

router.put(
  '/api/minecraft/servers/:id/files',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { path } = req.query;
    const { content } = req.body;

    const serverDirectory = nodePath.join(
      process.cwd(),
      '../server-data/minecraft/',
      minecraftServerManager.getServer(id).controller.name
    );

    const fileExplorer = new FileExplorer(serverDirectory);
    const data = await fileExplorer.updateFile(
      String(path),
      content.toString()
    );
    res.json({ newContent: data });
  }
);

export { router as minecraftFilesUpdateOneRouter };
