import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { docker } from "../../../app";
import { query } from "express-validator";
import { validateRequest } from "../../../middleware/validate-request";

const router = express.Router();

const validations = [query("includeVolume").default(false).isBoolean()];

router.delete(
  "/servers/:id",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { includeVolume } = req.query;

    const container = await docker.delete(id, Boolean(includeVolume));

    res.json({
      id: container.id,
      name: container.name,
    });
  }
);

export { router as serversDeleteRouter };
