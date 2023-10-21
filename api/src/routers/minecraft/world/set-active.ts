import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/servers/:id/world/activate',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    await minecraftServerManager.getServer(id).setActiveWorld(name);
    res.send();
  }
);

export { router as minecraftWorldActivateRouter };
