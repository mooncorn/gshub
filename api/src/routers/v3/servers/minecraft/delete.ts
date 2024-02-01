import express, { Request, Response } from "express";
import { currentUser } from "../../../../middleware/current-user";
import { requireAuth } from "../../../../middleware/require-auth";
import { docker } from "../../../../app";

const router = express.Router();

router.delete(
  "/servers/minecraft/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const container = await docker.delete(id, true);

    res.json({
      id: container.id,
      name: container.name,
    });
  }
);

export { router as minecraftDeleteRouter };
