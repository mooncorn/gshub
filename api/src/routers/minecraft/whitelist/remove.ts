import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';
const router = express.Router();

router.delete(
  '/api/minecraft/servers/:id/whitelist',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username } = req.body;

    const message = await minecraftServerManager
      .getServer(id)
      .executeCommand(`whitelist remove ${username}`);
    res.json({ message });
  }
);

export { router as minecraftWhitelistRemoveRouter };
