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
    try {
      res.json({ console: await valheimServer.getLogs(50) });
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as valheimConsoleRouter };
