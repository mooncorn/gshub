import { base } from "./base";

export async function stopInstance({ instanceId }: { instanceId: string }) {
  return (await base.post(`/instances/${instanceId}/stop`)).data;
}
