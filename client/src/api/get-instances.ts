import { base } from "./base";
import { Instance } from "./types";

export async function getInstances() {
  return (await base.get<Instance[]>("/instances")).data;
}
