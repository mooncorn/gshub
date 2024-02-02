import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { docker } from "../../app";
import { query } from "express-validator";
import { validateRequest } from "../../middleware/validate-request";
import { getPublicVolumeBinds } from "../../lib/utils";

const router = express.Router();

const validations = [query("image").optional().isString()];

router.get(
  "/servers/",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { image } = req.query;

    const containers = docker.list(
      image ? (c) => c.image !== image : undefined
    );

    const results = containers.map((container) => ({
      id: container.id,
      name: container.name,
      image: container.image,
      running: container.running,
      env: container.env,
      portBinds: container.portBinds,
      volumeBinds: getPublicVolumeBinds(container.volumeBinds),
    }));

    res.json(results);
  }
);

export { router as serversGetAllRouter };
