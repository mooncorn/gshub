import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { FileExplorer } from '../../../lib/file-explorer';
import * as nodePath from 'path';
import { requireAuth } from '../../../middleware/require-auth';
import { requireAdmin } from '../../../middleware/require-admin';

const router = express.Router();

router.put(
  '/api/valheim/servers/valheim/files',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { path } = req.query;
    const { content } = req.body;

    const serverDirectory = nodePath.join(
      process.cwd(),
      '../server-data/valheim/'
    );

    const fileExplorer = new FileExplorer(serverDirectory);
    const data = await fileExplorer.updateFile(
      String(path),
      content.toString()
    );
    res.json({ newContent: data });
  }
);

export { router as valheimFilesUpdateOneRouter };
