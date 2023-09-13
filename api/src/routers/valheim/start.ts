import express, { Request, Response } from 'express';
import { valheimServer } from '../../app';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';
import { BadRequestError } from '../../lib/exceptions/bad-request-error';

const router = express.Router();

router.post(
  '/api/valheim/start',
  currentUser,
  requireAuth,
  async (_: Request, res: Response) => {
    try {
      await valheimServer.start();
      res.json({ message: 'Server startup initiated' });
    } catch (err) {
      if (err instanceof BadRequestError) res.json({ message: err.message });
      else throw err;
    }
  }
);

export { router as valheimStartRouter };
