import express, { Request, Response } from 'express';
import { valheimServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/valheim/start',
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    try {
      await valheimServer.start();
      res.json({ message: 'Server startup initiated' });
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as valheimStartRouter };
