import { docker, server } from "./app";

const port = process.env.PORT || 3001;

const start = async () => {
  await docker.init();

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();
