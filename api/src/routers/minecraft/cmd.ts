import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { body } from 'express-validator';
import { validateRequest } from '../../middleware/validate-request';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';
import { requireAdmin } from '../../middleware/require-admin';

const router = express.Router();

const validations = [
  body('cmd')
    .isString()
    .withMessage('Name needs to be a string')
    .isLength({ min: 1 })
    .withMessage('Name needs to be a between 1 and 10 characters long'),
];

router.post(
  '/api/minecraft/cmd',
  currentUser,
  requireAuth,
  requireAdmin,
  validateRequest(validations),
  (req: Request, res: Response) => {
    const { cmd } = req.body;

    try {
      minecraftServer.executeCommand(cmd);
      res.send();
    } catch (err) {
      if (err instanceof Error) res.status(400).json({ message: err.message });
    }
  }
);

export { router as minecraftCmdRouter };
