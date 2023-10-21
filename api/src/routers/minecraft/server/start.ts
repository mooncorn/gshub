import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/servers/:id/start',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await minecraftServerManager.start(id);
    res.send();
  }
);

export { router as minecraftStartRouter };
