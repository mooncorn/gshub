import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/minecraft/servers',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { name, version, type } = req.body;

    await minecraftServerManager.create({
      name,
      version,
      type,
    });
    res.status(201).send();
  }
);

export { router as minecraftCreateRouter };
