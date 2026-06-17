import {ApplicationConfig, OrderServiceApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  if (!options.rest) options.rest = {};
  options.rest.port = +(process.env.PORT ?? 3001);
  options.rest.host = process.env.HOST ?? '0.0.0.0';

  const app = new OrderServiceApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? '0.0.0.0',
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
