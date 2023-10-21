import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import * as nodePath from 'path';
import { minecraftServerManager } from '../../../app';
import { FileExplorer } from '../../../lib/file-explorer';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/servers/:id/files',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { path } = req.query;

    const serverDirectory = nodePath.join(
      process.cwd(),
      '../server-data/minecraft/',
      minecraftServerManager.getServer(id).controller.name
    );

    const fileExplorer = new FileExplorer(serverDirectory);
    const files = await fileExplorer.listFilesAndFolders(String(path ?? ''));
    res.json({ files });
  }
);

export { router as minecraftFilesListRouter };
