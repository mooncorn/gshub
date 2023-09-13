import express, { Request, Response } from 'express';
import { valheimServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/valheim/console',
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    res.json({ console: await valheimServer.getLogs(50) });
  }
);

export { router as valheimConsoleRouter };
