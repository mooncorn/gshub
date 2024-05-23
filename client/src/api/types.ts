export enum InstanceType {
  T2Medium = "t2.medium",
  T2Micro = "t2.micro",
  T2Small = "t2.small",
  T3Medium = "t3.medium",
  T3Micro = "t3.micro",
  T3Small = "t3.small",
}

export type InstanceState =
  | "stopped"
  | "running"
  | "pending"
  | "stopping"
  | "terminated"
  | "shutting-down";

export interface Instance {
  Id: string;
  Type: InstanceType;
  LaunchTime: Date;
  PublicIp: string;
  State: InstanceState;
}

export interface Container {
  Id: string;
  Image: string;
  Env: string[];
  Ports: string[];
  Mounts: {
    Source: string;
    Destination: string;
  };
  Status: string;
  Running: boolean;
}

export interface MinecraftVersion {
  id: string;
  type: "snapshot" | "release";
  url: string;
  time: Date;
  releaseTime: Date;
}

export interface MinecraftVersions {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: MinecraftVersion[];
}
