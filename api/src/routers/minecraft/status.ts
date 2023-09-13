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
    res.json({ status: minecraftServer.getStatus() });
  }
);

export { router as minecraftStatusRouter };
