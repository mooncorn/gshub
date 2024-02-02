import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { docker } from "../../app";
import { param } from "express-validator";
import { validateRequest } from "../../middleware/validate-request";

const router = express.Router();

const validations = [param("id").isLength({ min: 64, max: 64 })];

router.post(
  "/servers/:id/restart",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await docker.restart(id);

    res.send();
  }
);

export { router as serversRestartRouter };
