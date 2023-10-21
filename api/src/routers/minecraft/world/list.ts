import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/servers/:id/world',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    res.json({
      worlds: await minecraftServerManager.getServer(id).getWorlds(),
    });
  }
);

export { router as minecraftWorldListRouter };
