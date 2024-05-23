import axios from "axios";
import { MinecraftVersions } from "./types";

export const getMinecraftVersions = async () => {
  return (
    await axios.get<MinecraftVersions>(
      "https://piston-meta.mojang.com/mc/game/version_manifest.json"
    )
  ).data;
};
