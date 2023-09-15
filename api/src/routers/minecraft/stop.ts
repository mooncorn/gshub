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
    try {
      minecraftServer.stop();
      res.json({ message: 'Server shutdown initiated' });
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as minecraftStopRouter };
