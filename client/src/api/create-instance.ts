import { base } from "./base";
import { Instance } from "./types";

export async function createInstance({
  instanceType,
}: {
  instanceType: string;
}) {
  return (
    await base.post<Instance>("/instances", {
      instanceType,
    })
  ).data;
}
