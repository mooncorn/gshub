import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/servers/:id/status',
  currentUser,
  requireAuth,
  (req: Request, res: Response) => {
    const { id } = req.params;

    res.json({
      status: minecraftServerManager.getServer(id).controller.status,
    });
  }
);

export { router as minecraftStatusRouter };
