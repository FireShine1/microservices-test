import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SequelizeModule } from "@nestjs/sequelize";
import { Profile } from './profiles.model';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

@Module({
    controllers: [ProfilesController],
    providers: [ProfilesService],
    imports: [
        ClientsModule.register([{
            name: 'auth_service',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://rabbitmq:5672'],
                queue: 'register-queue',
                queueOptions: {
                    durable: false
                }
            }
        }]),
        SequelizeModule.forFeature([Profile]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h'
            }
        }),
    ],
    exports: [
        ProfilesService,
    ]
})
export class ProfilesModule { };