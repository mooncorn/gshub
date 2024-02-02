import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { docker } from "../../app";
import { param, query } from "express-validator";
import { validateRequest } from "../../middleware/validate-request";

const router = express.Router();

const validations = [
  param("id").isLength({ min: 64, max: 64 }),
  query("limit").default(50).isInt({ min: 1 }),
];

router.get(
  "/servers/:id/logs",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { limit } = req.query;

    const container = docker.getContainer(id);

    const logs = await container.getLogs(Number(limit));
    res.send({ logs });
  }
);

export { router as serversGetLogsRouter };
