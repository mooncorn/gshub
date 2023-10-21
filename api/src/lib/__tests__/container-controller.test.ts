import path from 'path';
import fs from 'fs/promises';
import { ContainerController, ContainerStatus } from '../container-controller';
import { docker } from '../docker';

describe('container-controller', () => {
  const containerName = 'test-container';
  const type = 'VANILLA';
  const version = 'LATEST';

  let containerController: ContainerController;

  const serverPath = path.join(
    process.cwd(),
    '../server-data/minecraft',
    containerName
  );

  beforeAll(async () => {
    // create a container
    await docker.createContainer({
      Image: 'itzg/minecraft-server',
      name: containerName,
      Env: ['EULA=true', `TYPE=${type}`, `VERSION=${version}`],
      HostConfig: {
        Binds: [`${serverPath}:/data`],
        PortBindings: { '25565/tcp': [{ HostPort: '25565' }] },
      },
    });

    containerController = new ContainerController({
      containerName: '/' + containerName,
    });

    await containerController!.init();
  });

  beforeEach(() => {});

  afterEach(() => {});

  afterAll(async () => {
    await fs.rm(serverPath, { recursive: true, force: true });
    await containerController.delete();
  });

  it('should initialize with the correct name and status', () => {
    expect(containerController.name).toEqual('/' + containerName);
    expect(containerController.status).toEqual(ContainerStatus.OFFLINE);
  });

  // it('should successfully initialize and attach streams during init', async () => {
  //   const containerInfo = { Id: 'myContainerId' };
  //   mockGetContainerInfo.mockResolvedValue(containerInfo);
  //   mockDockerGetContainer.mockReturnValue({
  //     attach: jest.fn().mockImplementation((_, streamCallback) => {
  //       // Simulate the stream
  //       streamCallback && streamCallback('Test data');
  //     }),
  //   });

  //   await containerController.init();

  //   expect(containerController.id).toEqual(containerInfo.Id);
  //   expect(mockDockerGetEvents).toHaveBeenCalled();
  //   expect(mockEmit).toHaveBeenCalledWith(
  //     ContainerController.STATUS_EVENT,
  //     ContainerStatus.ONLINE
  //   );
  // });

  // it('should start the container', async () => {
  //   mockDockerGetContainer.mockReturnValue({
  //     start: jest.fn(),
  //   });

  //   await containerController.start();

  //   expect(mockDockerGetContainer().start).toHaveBeenCalled();
  // });

  // it('should stop the container', async () => {
  //   mockDockerGetContainer.mockReturnValue({
  //     stop: jest.fn(),
  //   });

  //   await containerController.stop();

  //   expect(mockDockerGetContainer().stop).toHaveBeenCalled();
  // });

  // it('should restart the container', async () => {
  //   mockDockerGetContainer.mockReturnValue({
  //     restart: jest.fn(),
  //   });

  //   await containerController.restart();

  //   expect(mockDockerGetContainer().restart).toHaveBeenCalled();
  // });

  // it('should delete the container', async () => {
  //   mockDockerGetContainer.mockReturnValue({
  //     remove: jest.fn(),
  //   });

  //   await containerController.delete();

  //   expect(mockDockerGetContainer().remove).toHaveBeenCalled();
  // });

  // it('should get container logs', async () => {
  //   mockDockerGetContainer.mockReturnValue({
  //     logs: jest.fn().mockResolvedValue(Buffer.from('Test logs')),
  //   });

  //   const logs = await containerController.getLogs();

  //   expect(logs).toEqual('Test logs');
  // });

  // it('should set and get the status of the container', () => {
  //   containerController.setStatus(ContainerStatus.ONLINE);
  //   expect(containerController.status).toEqual(ContainerStatus.ONLINE);

  //   containerController.setStatus(ContainerStatus.OFFLINE);
  //   expect(containerController.status).toEqual(ContainerStatus.OFFLINE);
  // });

  // it('should throw an error when accessing methods without initialization', () => {
  //   const methods = ['start', 'stop', 'restart', 'delete', 'getLogs'];

  //   for (const method of methods) {
  //     expect(() => (containerController as any)[method]()).toThrow(
  //       InternalError
  //     );
  //   }
  // });
});
