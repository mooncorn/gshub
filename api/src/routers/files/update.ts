import express, { Request, Response } from 'express';
import { mapToGameDirectory } from '../../lib/utils';
import { FileExplorer } from '../../lib/file-explorer';
import { body, query } from 'express-validator';
import { validateRequest } from '../../middleware/validate-request';
import { requireAdmin } from '../../middleware/require-admin';
import { requireAuth } from '../../middleware/require-auth';
import { currentUser } from '../../middleware/current-user';

const router = express.Router();

const validations = [
  query('path').optional().isString(),
  body('content').exists(),
];

router.put(
  '/file',
  currentUser,
  requireAuth,
  requireAdmin,
  validateRequest(validations),
  async (req: Request, res: Response) => {
    const game = req.originalUrl.split('/')[2];
    const gameDirectory = mapToGameDirectory(game);
    const { path } = req.query;
    const { content } = req.body;

    const fileExplorer = new FileExplorer(gameDirectory);
    const data = await fileExplorer.updateFile(
      String(path ?? ''),
      content.toString()
    );

    res.json({ newContent: data });
  }
);

export { router as fileExplorerUpdateRouter };
