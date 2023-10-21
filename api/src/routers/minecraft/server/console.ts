import express, { Request, Response } from 'express';
import { minecraftServerManager } from '../../../app';
import { currentUser } from '../../../middleware/current-user';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/servers/:id/console',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const console = await minecraftServerManager.getServer(id).getLogs(50);
    res.json({ console: console || '' });
  }
);

export { router as minecraftConsoleRouter };
