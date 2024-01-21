import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { body } from "express-validator";
import { validateRequest } from "../../../middleware/validate-request";
import { config } from "../../../config";
import { BadRequestError } from "../../../lib/exceptions/bad-request-error";
import { docker } from "../../../app";

const router = express.Router();

const validations = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: config.params.name.min, max: config.params.name.max })
    .isAlphanumeric(),
  body("type").optional().toUpperCase().isIn(config.minecraft.types),
  body("version").optional().toUpperCase().isIn(config.minecraft.versions),
];

router.put(
  "/servers/minecraft/:id",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { type, version, name } = req.body;
    const { id } = req.params;

    if (!type && !version && !name) {
      throw new BadRequestError("Nothing to update");
    }

    console.log(id, req.body);

    const container = docker.getContainer(id);

    const updated = await docker.update(id, {
      env: {
        TYPE: type || container.env.TYPE,
        VERSION: version || container.env.VERSION,
      },
      name,
    });

    res.json({
      id: updated.id,
      name: updated.name,
      running: updated.running,
      files: !!updated.files,
      type: updated.env.TYPE,
      version: updated.env.VERSION,
    });

    //   {
    //   id: server.id,
    //   name: server.name,
    //   running,
    //   files,
    //   type: server.type,
    //   version: server.version,
    // }
  }
);

export { router as minecraftUpdateRouter };
