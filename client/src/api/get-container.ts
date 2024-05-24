import { base } from "./base";
import { Container } from "./types";

export async function getContainer({ instanceId }: { instanceId: string }) {
  return (await base.get<Container>(`/instances/${instanceId}/container`)).data;
}
