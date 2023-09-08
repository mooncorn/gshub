import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/console',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    res.json({ console: (await minecraftServer.getLogs()) ?? '' });
  }
);

export { router as minecraftConsoleRouter };
