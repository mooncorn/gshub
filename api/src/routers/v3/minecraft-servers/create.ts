import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { minecraftServerManager } from "../../../app";
import { body } from "express-validator";
import { versions } from "../../../lib/v3/servers/minecraft/minecraft-versions";
import { validateRequest } from "../../../middleware/validate-request";
import { types } from "../../../lib/v3/servers/minecraft/minecraft-types";

const router = express.Router();

const validations = [
  body("name").isString().isLength({ min: 4, max: 16 }),
  body("type")
    .optional()
    .isString()
    .toUpperCase()
    .isIn(types)
    .default(types[0]),
  body("version")
    .optional()
    .isString()
    .toUpperCase()
    .isIn(versions)
    .default(versions[0]),
];

router.post(
  "/minecraft-servers/",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { name, type, version } = req.body;

    const server = await minecraftServerManager.create({
      name,
      type,
      version,
    });

    const running = await server.isRunning();
    const files: boolean = !!server.files;

    res.json({
      id: server.id,
      name: server.name,
      running,
      files,
      type: server.type,
      version: server.version,
    });
  }
);

export { router as minecraftCreateRouter };
