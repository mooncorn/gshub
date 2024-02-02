import express, { Request, Response } from "express";
import { body } from "express-validator";
import { docker } from "../../../app";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { validateRequest } from "../../../middleware/validate-request";
import { config } from "../../../config";

const router = express.Router();

const validations = [
  body("name")
    .isString()
    .isLength({ min: config.params.name.min, max: config.params.name.max })
    .isAlphanumeric(),
  body("image").isString().isLength({ min: 1 }).isAlphanumeric(),
  body("env").default({}).isObject(),
  body("portBinds").default({}).isObject(),
  body("volumeBinds").default([]).isArray(),
];

router.post(
  "/servers/",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { name, image, env, portBinds, volumeBinds } = req.body;

    const container = await docker.create({
      name,
      image,
      env,
      portBinds,
      volumeBinds,
    });

    res.json({
      id: container.id,
      name: container.name,
      running: container.running,
      env: container.env,
      portBinds: container.portBinds,
      volumeBinds: container.volumeBinds,
    });
  }
);

export { router as serversCreateRouter };
