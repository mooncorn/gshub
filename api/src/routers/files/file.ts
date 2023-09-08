import express, { Request, Response } from 'express';
import { mapToGameDirectory } from '../../lib/utils';
import { FileExplorer } from '../../lib/file-explorer';
import { query } from 'express-validator';
import { validateRequest } from '../../middleware/validate-request';
import { BadRequestError } from '../../lib/exceptions/bad-request-error';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

const validations = [query('path').optional().isString()];

router.get(
  '/file',
  currentUser,
  requireAuth,
  validateRequest(validations),
  async (req: Request, res: Response) => {
    const game = req.originalUrl.split('/')[2];
    const gameDirectory = mapToGameDirectory(game);
    const { path } = req.query;
    const fileName = path?.toString().split('/').at(-1);

    const fileExplorer = new FileExplorer(gameDirectory);
    const data = await fileExplorer.readFile(String(path ?? ''));

    if (typeof data === 'string') {
      // Text-based file, respond with JSON content
      res.json({ content: data });
      return;
    }

    throw new BadRequestError('Cannot read file');

    // Binary file, respond with a downloadable attachment
    // res.setHeader('Content-Type', data.mimeType ?? '');
    // res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    // res.send(data.fileBuffer);
  }
);

export { router as fileExplorerFileRouter };
