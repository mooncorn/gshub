import { base } from "./base";
import { Container } from "./types";

export async function createContainer({
  instanceId,
  image,
  ports,
  volume,
  env,
}: {
  instanceId: string;
  image: string;
  ports: string[];
  volume: string;
  env: string[];
}) {
  return (
    await base.post<Container>(`/instances/${instanceId}/container`, {
      image,
      ports,
      volume,
      env,
    })
  ).data;
}
