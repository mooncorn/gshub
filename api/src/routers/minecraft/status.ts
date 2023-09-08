import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/status',
  currentUser,
  requireAuth,
  (req: Request, res: Response) => {
    minecraftServer.process
      ? res.json({ status: 'online' })
      : res.json({ status: 'offline' });
  }
);

export { router as minecraftStatusRouter };
