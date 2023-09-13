import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/stop',
  currentUser,
  requireAuth,
  (_: Request, res: Response) => {
    minecraftServer.stop();
    res.json({ message: 'Server shutdown initiated' });
  }
);

export { router as minecraftStopRouter };
