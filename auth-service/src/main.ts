import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    const authService = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://rabbitmq:5672'],
            queue: 'register-queue',
            queueOptions: {
                durable: false
            }
        }
    })

    await app.startAllMicroservices();
    await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

start();
