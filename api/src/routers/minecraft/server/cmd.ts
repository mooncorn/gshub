import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';
import { requireAdmin } from '../../../middleware/require-admin';
const router = express.Router();

router.post(
  '/api/minecraft/servers/:id/cmd',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cmd } = req.body;

    const msg = await minecraftServerManager.getServer(id).executeCommand(cmd);
    res.json({ message: msg });
  }
);

export { router as minecraftCmdRouter };
