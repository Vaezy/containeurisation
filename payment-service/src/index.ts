import * as amqp from 'amqplib'; // 1. On n'oublie pas d'importer amqplib
import {ApplicationConfig, PaymentServiceApplication} from './application';

export * from './application';

async function startRabbitMQListener() {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    const queueName = 'order_created';
    await channel.assertQueue(queueName, {durable: true});

    console.log(`[RabbitMQ] payment-service écoute la file : ${queueName}`);

    channel.consume(queueName, msg => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());

          console.log(
            `[RabbitMQ] Message reçu dans payment-service :`,
            content,
          );
          console.log(
            `[Payment Service] 💳 Traitement du paiement pour la commande ID: ${content.id || content._id}`,
          );

          channel.ack(msg);
        } catch (parseError) {
          console.error(
            `[RabbitMQ] Erreur de parsing dans payment-service :`,
            msg.content.toString(),
          );
          channel.ack(msg);
        }
      }
    });
  } catch (error) {
    console.error("[RabbitMQ] Erreur d'écoute dans payment-service :", error);
    setTimeout(startRabbitMQListener, 5000);
  }
}

export async function main(options: ApplicationConfig = {}) {
  if (!options.rest) options.rest = {};
  options.rest.port = +(process.env.PORT ?? 3002);
  options.rest.host = process.env.HOST ?? '0.0.0.0';

  const app = new PaymentServiceApplication(options);
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
