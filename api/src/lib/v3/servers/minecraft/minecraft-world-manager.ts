import { BadRequestError } from "../../../exceptions/bad-request-error";
import { MinecraftServer } from "./minecraft-server";

export type LevelType =
  | "normal"
  | "flat"
  | "large_biomes"
  | "amplified"
  | "single_biome_surface";

export interface CreateWorldOpts {
  name: string;
  seed?: string;
  type?: LevelType;
  generateStructures?: boolean;
}

const DEFUALT_CREATE_WORLD_OPTS: CreateWorldOpts = {
  name: "world",
  seed: "",
  type: "normal",
  generateStructures: true,
};

export class MinecraftWorldManager {
  constructor(private server: MinecraftServer) {}

  public async list() {
    const files = await this.server.files?.listFilesAndFolders("/data");
    if (!files) throw new BadRequestError("Could not read server files");
    return files
      .filter((f) => f.name.includes("world"))
      .map((f) => f.name.replace("world-", ""));
  }

  public async create(opts: CreateWorldOpts) {}

  public async upload(world: Buffer) {}

  public async delete(name: string) {}

  public async activate(name: string) {}

  public async getActive() {}

  private parseName(name: string) {}
}
