import express, { Request, Response } from 'express';
import { currentUser } from '../../../middleware/current-user';
import { minecraftServerManager } from '../../../app';
import multer from 'multer';
import { requireAuth } from '../../../middleware/require-auth';

const router = express.Router();

const storage = multer.memoryStorage(); // Store the uploaded file in memory
const upload = multer({ storage });

router.post(
  '/api/minecraft/servers/:id/world',
  currentUser,
  requireAuth,
  upload.single('world'),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const world = req.file;

    await minecraftServerManager.getServer(id).uploadWorld(world?.buffer);

    res.send();
  }
);

export { router as minecraftWorldUploadRouter };
