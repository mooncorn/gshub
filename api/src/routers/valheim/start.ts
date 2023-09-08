import express, { Request, Response } from 'express';
import { valheimServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';

const router = express.Router();

router.post(
  '/api/valheim/start',
  currentUser,
  requireAuth,
  (req: Request, res: Response) => {
    valheimServer.start();
    res.json({ message: 'Valheim server startup initiated' });
  }
);

export { router as valheimStartRouter };
