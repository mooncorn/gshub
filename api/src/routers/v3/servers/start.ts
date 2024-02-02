import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { docker } from "../../../app";

const router = express.Router();

router.post(
  "/servers/:id/start",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await docker.start(id);

    res.status(200).send();
  }
);

export { router as serversStartRouter };
