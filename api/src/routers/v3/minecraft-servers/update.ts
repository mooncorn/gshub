import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { minecraftServerManager } from "../../../app";
import { body } from "express-validator";
import { versions } from "../../../lib/v3/servers/minecraft/minecraft-versions";
import { validateRequest } from "../../../middleware/validate-request";
import { types } from "../../../lib/v3/servers/minecraft/minecraft-types";
import { BadRequestError } from "../../../lib/exceptions/bad-request-error";

const router = express.Router();

const validations = [
  body("name").optional().isString().isLength({ min: 4, max: 16 }),
  body("type").optional().isString().toUpperCase().isIn(types),
  body("version").optional().isString().toUpperCase().isIn(versions),
];

router.put(
  "/minecraft-servers/:id",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { type, version, name } = req.body;
    const { id } = req.params;

    if (!type && !version && !name)
      throw new BadRequestError(
        "You must provide either name, type, or version."
      );

    const server = await minecraftServerManager.update(id, {
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

export { router as minecraftUpdateRouter };
