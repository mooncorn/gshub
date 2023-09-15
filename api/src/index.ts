import { app, minecraftServer, valheimServer } from './app';

const port = process.env.PORT || 3001;

const start = async () => {
  await minecraftServer.init();
  await valheimServer.init();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();
