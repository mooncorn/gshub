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
    minecraftServer.start();
    res.json({ message: 'Server startup initiated' });
  }
);

export { router as minecraftStartRouter };
