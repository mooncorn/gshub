import express, { Request, Response } from 'express';
import { minecraftServerManager } from '../../../app';
import { currentUser } from '../../../middleware/current-user';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/servers/:id/restart',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await minecraftServerManager.getServer(id).restart();
    res.send();
  }
);

export { router as minecraftRestartRouter };
