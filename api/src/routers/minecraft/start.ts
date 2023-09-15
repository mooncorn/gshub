import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/start',
  currentUser,
  requireAuth,
  (_: Request, res: Response) => {
    try {
      minecraftServer.start();
      res.json({ message: 'Server startup initiated' });
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as minecraftStartRouter };
