import express, { Request, Response } from "express";
import { currentUser } from "../../../middleware/current-user";
import { requireAuth } from "../../../middleware/require-auth";
import { docker } from "../../../app";
import { BadRequestError } from "../../../lib/exceptions/bad-request-error";
import { param, query } from "express-validator";
import { validateRequest } from "../../../middleware/validate-request";
import { FileExplorer } from "../../../lib/files/file-explorer";
import { getContainerDir } from "../../../lib/utils";

const router = express.Router();

const validations = [
  query("path").default(""),
  param("id").isLength({ min: 64, max: 64 }),
];

router.get(
  "/files/:id",
  validateRequest(validations),
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { path } = req.query;
    const { id } = req.params;

    const container = docker.getContainer(id);

    if (!container.volumeBinds)
      throw new BadRequestError("Container's volume is not mounted");

    const fileExplorer = new FileExplorer(getContainerDir(container.name));

    const files = await fileExplorer.listFilesAndFolders(path as string);

    res.json({ files });
  }
);

export { router as filesListRouter };
