import * as amqp from 'amqplib';
import {ApplicationConfig, OrderServiceApplication} from './application';

export * from './application';

async function startRabbitMQListener() {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    const queueName = 'book_deleted_queue';
    await channel.assertQueue(queueName, {durable: true});

    console.log(`[RabbitMQ] order-service écoute la file : ${queueName}`);

    channel.consume(queueName, msg => {
      if (msg !== null) {
        try {
          const rawContent = msg.toString();
          const content = JSON.parse(rawContent);

          console.log(`[RabbitMQ] Message reçu dans order-service :`, content);
          console.log(
            `[Order Service] Suppression détectée pour le livre ID: ${content.bookId}`,
          );

          channel.ack(msg);
        } catch (parseError) {
          console.error(
            `[RabbitMQ] Erreur de parsing ou message invalide :`,
            msg.toString(),
          );
          channel.ack(msg);
        }
      }
    });
  } catch (error) {
    console.error("[RabbitMQ] Erreur d'écoute dans order-service :", error);
    setTimeout(startRabbitMQListener, 5000);
  }
}

export async function publishOrderCreated(order: any) {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    const queueName = 'order_created';
    await channel.assertQueue(queueName, {durable: true});

    // Envoi du message sous forme de JSON textuel
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(order)), {
      persistent: true,
    });

    console.log(`[RabbitMQ] Commande envoyée à la file ${queueName} :`, order);

    // On attend un tout petit peu avant de fermer le canal pour être sûr que le message est parti
    setTimeout(async () => {
      await channel.close();
      await connection.close();
    }, 500);
  } catch (error) {
    console.error(
      '[RabbitMQ] Erreur lors de la publication de la commande :',
      error,
    );
  }
}

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

  startRabbitMQListener();

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
