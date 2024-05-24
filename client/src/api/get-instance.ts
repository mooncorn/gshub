import { base } from "./base";
import { Instance } from "./types";

export async function getInstance({ instanceId }: { instanceId: string }) {
  return (await base.get<Instance>(`/instances/${instanceId}`)).data;
}
