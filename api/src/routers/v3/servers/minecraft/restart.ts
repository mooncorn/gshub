import express, { Request, Response } from "express";
import { currentUser } from "../../../../middleware/current-user";
import { requireAuth } from "../../../../middleware/require-auth";
import { docker } from "../../../../app";

const router = express.Router();

router.post(
  "/servers/minecraft/:id/restart",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await docker.restart(id);

    res.send();
  }
);

export { router as minecraftRestartRouter };
