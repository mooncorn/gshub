import express, { Request, Response } from 'express';
import { minecraftServer } from '../../app';
import { body } from 'express-validator';
import { validateRequest } from '../../middleware/validate-request';
import { isOfTypeLevelType } from '../../lib/utils';
import { currentUser } from '../../middleware/current-user';
import { requireAuth } from '../../middleware/require-auth';
import { requireAdmin } from '../../middleware/require-admin';

const router = express.Router();

const validations = [
  body('name')
    .isString()
    .withMessage('Name needs to be a string')
    .isLength({ min: 1, max: 10 })
    .withMessage('Name needs to be a between 1 and 10 characters long'),
  body('seed').optional().isString().withMessage('Seed needs to be a string'),
  body('type')
    .optional()
    .isString()
    .withMessage('Type needs to be a string')
    .custom((value) => {
      if (isOfTypeLevelType(value)) return value;
      throw new Error();
    })
    .withMessage(
      "Type needs to be 'normal' | 'flat' | 'large_biomes' | 'amplified' | 'single_biome_surface'"
    ),
  body('generateStructures')
    .optional()
    .isBoolean()
    .withMessage('Generate structures needs to be true or false'),
];

router.post(
  '/api/minecraft/edit',
  currentUser,
  requireAuth,
  requireAdmin,
  validateRequest(validations),
  (req: Request, res: Response) => {
    const { name, seed, type, generateStructures } = req.body;

    minecraftServer.edit({
      name: String(name),
      seed,
      type,
      generateStructures,
    });

    res.send();
  }
);

export { router as minecraftEditRouter };
