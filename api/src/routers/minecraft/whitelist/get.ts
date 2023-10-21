import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import * as nodePath from 'path';
import { minecraftServerManager } from '../../../app';
import { FileExplorer } from '../../../lib/file-explorer';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/servers/:id/whitelist',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const serverDirectory = nodePath.join(
      process.cwd(),
      '../server-data/minecraft/',
      minecraftServerManager.getServer(id).controller.name
    );

    const fileExplorer = new FileExplorer(serverDirectory);
    const content = await fileExplorer.readFile('./whitelist.json');
    res.json({ whitelist: JSON.parse(content) });
  }
);

export { router as minecraftWhitelistGetRouter };
