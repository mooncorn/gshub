import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { query } from "express-validator";
import { validateRequest } from "../../middleware/validate-request";
import { FileExplorer } from "../../lib/files/file-explorer";
import { env } from "../../lib/env";

const router = express.Router();

const validations = [query("path").default("")];

router.delete(
  "/volumes",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { name } = req.params;
    const fileExplorer = new FileExplorer(env.CONTAINERS_DIR);

    // TODO: delete target path
  }
);

export { router as serversDeleteRouter };
