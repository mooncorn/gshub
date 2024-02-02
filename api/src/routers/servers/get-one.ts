import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { docker } from "../../app";
import { getPublicVolumeBinds } from "../../lib/utils";
import { param } from "express-validator";
import { validateRequest } from "../../middleware/validate-request";

const router = express.Router();

const validations = [param("id").isLength({ min: 64, max: 64 })];

router.get(
  "/servers/:id",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const container = docker.getContainer(id);

    res.json({
      id: container.id,
      name: container.name,
      image: container.image,
      running: container.running,
      env: container.env,
      portBinds: container.portBinds,
      volumeBinds: getPublicVolumeBinds(container.volumeBinds),
    });
  }
);

export { router as serversGetOneRouter };
