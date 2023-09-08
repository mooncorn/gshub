import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/restart',
  currentUser,
  requireAuth,
  (req: Request, res: Response) => {
    minecraftServer.restart();
    res.json({ message: 'Server restart initiated' });
  }
);

export { router as minecraftRestartRouter };
