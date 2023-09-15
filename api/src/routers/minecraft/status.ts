import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/status',
  currentUser,
  requireAuth,
  (_: Request, res: Response) => {
    try {
      res.json({ status: minecraftServer.status.toString() });
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as minecraftStatusRouter };
