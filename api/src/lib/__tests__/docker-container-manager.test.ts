import { DockerContainerManager } from '../docker-container-manager';
import { DockerContainer } from '../docker-container';

describe('docker-container-manager', () => {
  const dockerContainerManager = new DockerContainerManager();
  let testContainer: DockerContainer;

  beforeAll(async () => {
    testContainer = await dockerContainerManager.create({
      name: 'test-docker-container-manager',
      image: 'ubuntu',
    });
  });

  afterAll(async () => {
    await dockerContainerManager.delete({ id: testContainer.id });
  });

  it('should get a list of containers', async () => {
    const containers = await dockerContainerManager.list({ all: true });
    const found = containers.find((c) => c.id === testContainer.id);
    expect(found).toBeDefined();
  });

  it('should get an existing container with a valid id', async () => {
    const container = await dockerContainerManager.getById(testContainer.id);
    expect(container).toBeDefined();
    expect(container.id).toBe(testContainer.id);
  });

  it('should get an existing container with a valid name', async () => {
    const container = await dockerContainerManager.getByName(
      testContainer.name
    );
    expect(container).toBeDefined();
    expect(container.name).toBe(testContainer.name);
  });

  it('should throw when getting a container by invalid id', async () => {
    await expect(
      async () => await dockerContainerManager.getById('foo')
    ).rejects.toThrow('Could not find container with id: foo');
  });

  it('should throw when getting a container by invalid name', async () => {
    await expect(
      async () => await dockerContainerManager.getByName('foo')
    ).rejects.toThrow('Could not find container with name: foo');
  });

  it('should create and delete a container', async () => {
    const container = await dockerContainerManager.create({
      image: 'ubuntu',
      name: 'create-container-test',
    });

    const found = await dockerContainerManager.getById(container.id);
    expect(found.id).toBe(container.id);

    await dockerContainerManager.delete({ id: container.id });
    await expect(
      async () => await dockerContainerManager.getById(container.id)
    ).rejects.toThrow(`Could not find container with id: ${container.id}`);
  });

  it('should throw when deleting a container with invalid id', async () => {
    await expect(
      async () => await dockerContainerManager.delete({ id: 'foo' })
    ).rejects.toThrow('Could not find container with id: foo');
  });

  it('should create a container with given options', async () => {
    const name = 'test-create-options';
    const image = 'ubuntu';
    const env: Record<string, string> = { foo: 'foo' };
    const volumeBinds = ['foo:/foo'];
    const portBinds = { '25565/tcp': [{ HostPort: '25565' }] };

    const container = await dockerContainerManager.create({
      name,
      image,
      env,
      volumeBinds,
      portBinds,
    });
    await dockerContainerManager.delete({ id: container.id });

    expect(container.name).toBe(`/${name}`);
    expect(container.image).toBe(image);
    expect(container.volumeBinds).toStrictEqual(volumeBinds);
    expect(container.portBinds['25565/tcp'].at(0)?.HostPort).toBe('25565');
    expect(container.env.foo).toBe('foo');
  });

  it('should update a container with given options', async () => {
    const name = 'test-update';
    const image = 'ubuntu';
    const env: Record<string, string> = { foo: 'foo' };
    const volumeBinds = ['foo:/foo'];
    const portBinds = { '25565/tcp': [{ HostPort: '25565' }] };

    const { id } = await dockerContainerManager.create({
      name,
      image,
      env,
      volumeBinds,
      portBinds,
    });

    const updatedName = 'foo-updated';
    env.foo2 = 'foo2';

    const updatedContainer = await dockerContainerManager.update({
      id,
      opts: {
        name: updatedName,
        env: env,
      },
    });
    await dockerContainerManager.delete({ id: updatedContainer.id });

    expect(updatedContainer.name).toBe(`/${updatedName}`);
    expect(updatedContainer.image).toBe(image);
    expect(updatedContainer.volumeBinds).toStrictEqual(volumeBinds);
    expect(updatedContainer.portBinds['25565/tcp'].at(0)?.HostPort).toBe(
      '25565'
    );
    expect(updatedContainer.env.foo).toBe('foo');
    expect(updatedContainer.env.foo2).toBe('foo2');
  });
});
