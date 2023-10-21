import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';
import { requireAdmin } from '../../../middleware/require-admin';

const router = express.Router();

router.delete(
  '/api/minecraft/servers/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await minecraftServerManager.delete(id, true);
    res.send();
  }
);

export { router as minecraftRemoveRouter };
