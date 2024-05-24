import { base } from "./base";

export async function startInstance({ instanceId }: { instanceId: string }) {
  return (await base.post(`/instances/${instanceId}/start`)).data;
}
