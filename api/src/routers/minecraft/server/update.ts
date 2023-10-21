import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.put(
  '/api/minecraft/servers/:id',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { version, type } = req.body;

    await minecraftServerManager.update(id, {
      type,
      version,
    });

    res.send();
  }
);

export { router as minecraftUpdateRouter };
