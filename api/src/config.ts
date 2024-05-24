export const config = {
  params: {
    name: {
      min: 4,
      max: 16,
    },
    port: {
      min: 1024,
      max: 65535,
    },
  },
  minecraft: {
    name: "minecraft",
    image: "itzg/minecraft-server",
    volumeBinds: ["/data"],
    default: {
      env: {
        EULA: "true",
        ENABLE_AUTOPAUSE: "true",
        MAX_TICK_TIME: "-1",
        MOTD: "Minecraft Server powered by gshub.pro",
      },
      type: "VANILLA",
      version: "LATEST",
      port: "25565",
    },
    internalPort: "25565/tcp",
    types: ["VANILLA", "SPIGOT"],
    versions: [
      "LATEST",
      "1.20.2",
      "1.20.1",
      "1.20",
      "1.19.4",
      "1.19.3",
      "1.19.2",
      "1.19.1",
      "1.19",
      "1.18.2",
      "1.18.1",
      "1.18",
      "1.17.1",
      "1.17",
      "1.16.5",
      "1.16.4",
      "1.16.3",
      "1.16.2",
      "1.16.1",
      "1.16",
      "1.15.2",
      "1.15.1",
      "1.15",
      "1.14.4",
      "1.14.3",
      "1.14.2",
      "1.14.1",
      "1.14",
      "1.13.2",
      "1.13.1",
      "1.13",
      "1.12.2",
      "1.12.1",
      "1.12",
      "1.11.2",
      "1.11.1",
      "1.11",
      "1.10.2",
      "1.10.1",
      "1.10",
      "1.9.4",
      "1.9.3",
      "1.9.2",
      "1.9.1",
      "1.9",
      "1.8.9",
      "1.8.8",
      "1.8.7",
      "1.8.6",
      "1.8.5",
      "1.8.4",
      "1.8.3",
      "1.8.2",
      "1.8.1",
      "1.8",
    ],
  },
  valheim: {
    name: "valheim",
    image: "lloesche/valheim-server",
    default: {
      port: 2456,
    },
  },
};
