import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { docker } from "../../../app";
import { body } from "express-validator";
import { validateRequest } from "../../../middleware/validate-request";
import { config } from "../../../config";
import { MinecraftServer } from "../../../lib/v3/servers/minecraft/minecraft-server";

const router = express.Router();

const validations = [
  body("name")
    .isString()
    .isLength({ min: config.params.name.min, max: config.params.name.max })
    .isAlphanumeric(),
  body("type")
    .default(config.minecraft.default.type)
    .toUpperCase()
    .isIn(config.minecraft.types),
  body("version")
    .default(config.minecraft.default.version)
    .toUpperCase()
    .isIn(config.minecraft.versions),
  body("port")
    .default(config.minecraft.default.port)
    .toInt()
    .isInt({ min: config.params.port.min, max: config.params.port.max }),
];

router.post(
  "/servers/minecraft/",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { name, type, version, port } = req.body;

    const container = await docker.create({
      name,
      image: config.minecraft.image,
      env: {
        ...config.minecraft.default.env,
        TYPE: type,
        VERSION: version,
      },
      portBinds: { [config.minecraft.internalPort]: port },
      volumeBinds: config.minecraft.volumeBinds,
    });

    res.json({
      id: container.id,
      name: container.name,
      running: container.running,
      files: !!container.files,
      type: container.env.TYPE,
      version: container.env.VERSION,
      port: container.portBinds
        ? container.portBinds[config.minecraft.internalPort]
        : null,
    });
  }
);

export { router as minecraftCreateRouter };
