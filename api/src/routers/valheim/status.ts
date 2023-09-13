import express, { Request, Response } from 'express';

import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';
import { valheimServer } from '../../app';

const router = express.Router();

router.get(
  '/api/valheim/status',
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    res.json({ status: valheimServer.status });
  }
);

export { router as valheimStatusRouter };
