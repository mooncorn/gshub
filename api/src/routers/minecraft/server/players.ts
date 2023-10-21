import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import * as McStatus from 'mcstatus';
import { ContainerStatus } from '../../../lib/container-controller';
import { BadRequestError } from '../../../lib/exceptions/bad-request-error';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

router.get(
  '/api/minecraft/servers/:id/players',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (
      minecraftServerManager.getServer(id).controller.status ===
      ContainerStatus.OFFLINE
    )
      throw new BadRequestError(
        'Server has to be online to check player count'
      );

    const status = await McStatus.checkStatus({
      host: 'localhost',
      port: 25565,
    });

    res.json({ status });
  }
);

export { router as minecraftPlayersRouter };
