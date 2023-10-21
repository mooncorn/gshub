import { app, valheimServer, minecraftServerManager } from './app';

const port = process.env.PORT || 3001;

const start = async () => {
  await valheimServer.init();

  await minecraftServerManager.init();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();
