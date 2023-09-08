import express, { Request, Response } from 'express';
import { mapToGameDirectory } from '../../lib/utils';
import { FileExplorer } from '../../lib/file-explorer';
import { query } from 'express-validator';
import { validateRequest } from '../../middleware/validate-request';
import { requireAuth } from '../../middleware/require-auth';
import { currentUser } from '../../middleware/current-user';

const router = express.Router();

const validations = [query('path').optional().isString()];

router.get(
  '/',
  currentUser,
  requireAuth,
  validateRequest(validations),
  async (req: Request, res: Response) => {
    const game = req.originalUrl.split('/')[2];
    const gameDirectory = mapToGameDirectory(game);
    const { path } = req.query;

    const fileExplorer = new FileExplorer(gameDirectory);
    const files = await fileExplorer.listFilesAndFolders(String(path ?? ''));

    res.json({ files });
  }
);

export { router as fileExplorerListRouter };
