// import { DockerContainerRepo } from '../docker-container-repo-deprecated';

// describe('docker-container-repo', () => {
//   const dockerContainerRepo = new DockerContainerRepo();
//   let containerId: string;
//   let containerName: string;

//   beforeAll(async () => {
//     const container = await dockerContainerRepo.create({
//       name: 'test-docker-container-repo',
//       image: 'ubuntu',
//     });
//     await container.init();
//     containerId = container.id;
//     containerName = container.name;
//   });

//   afterAll(async () => {
//     await dockerContainerRepo.delete({ id: containerId });
//   });

//   it('should get a list of containers', async () => {
//     const list = await dockerContainerRepo.list({ all: true });
//     const found = list.find((c) => c.id === containerId);
//     expect(found).toBeDefined();
//   });

//   // it('should initialize the container', async () => {
//   //   const _container = await dockerContainerRepo.getById(containerId);
//   //   expect(_container.initialized).toBe(true);
//   // });

//   it('should get an existing container with a valid id', async () => {
//     const container = await dockerContainerRepo.getById(containerId);
//     expect(container.id).toBe(containerId);
//   });

//   it('should get an existing container with a valid name', async () => {
//     const container = await dockerContainerRepo.getByName(containerName);
//     expect(container.name).toBe(containerName);
//   });

//   it('should create a container', async () => {
//     const container = await dockerContainerRepo.create({
//       name: 'test-docker-container-repo-create',
//       image: 'ubuntu',
//     });

//     const found = await dockerContainerRepo.getById(container.id);
//     dockerContainerRepo.delete({ id: container.id });

//     expect(container).toStrictEqual(found);
//   });

//   it('should delete a container', async () => {});

//   it('should update a container', async () => {});
// });
