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
    .isInt({ min: 1024, max: 65535 }),
];

router.post(
  "/minecraft-servers/",
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
    });

    const server = new MinecraftServer(container);

    res.json({
      id: server.id,
      name: server.name,
      running: server.running,
      files: !!server.files,
      type: server.env.TYPE,
      version: server.env.VERSION,
      port: server.portBinds && server.portBinds[config.minecraft.internalPort],
    });
  }
);

export { router as minecraftCreateRouter };
