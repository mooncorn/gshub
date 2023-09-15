import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/console',
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    try {
      res.json({ console: (await minecraftServer.getLogs(50)) ?? '' });
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as minecraftConsoleRouter };
