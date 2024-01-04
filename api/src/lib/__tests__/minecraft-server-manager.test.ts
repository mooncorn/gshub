import { Server } from "socket.io";
import { MinecraftServerManagerFactory } from "../v2/server-manager-factory";
import { MinecraftServerManager } from "../v2/minecraft-server-manager";

describe("minecraft-server-manager", () => {
  const io = new Server();
  const factory = new MinecraftServerManagerFactory(io);
  let manager: MinecraftServerManager;

  beforeAll(async () => {
    manager = await factory.create();
  });

  it("initializes minecraft server manager", async () => {
    console.log(manager.list());

    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(MinecraftServerManager);
  });
});
