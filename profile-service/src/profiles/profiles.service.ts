import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { CreateUserDto } from "./dto/create-user.dto";
import { RegisterDto } from './dto/register.dto';
import { Profile } from './profiles.model';
import { ProfileDto } from './dto/profile.dto';
import ChannelWrapper from 'amqp-connection-manager/dist/esm/ChannelWrapper';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProfilesService {
    channel: ChannelWrapper;

    constructor(@InjectModel(Profile) private profileRepository: typeof Profile,
        @Inject('auth_service') private client: ClientProxy) { };

    async login(userDto: CreateUserDto) {
        return await firstValueFrom(this.client.send("login-request", userDto));
    }

    //Получаем объекты и для юзера (аутентификация) и для профиля
    async register(registerDto: RegisterDto) {
        const { userDto, profileDto } = registerDto;

        const {token, user} = await firstValueFrom(this.client.send("register-request", userDto));

        const profile = await this.profileRepository.create(profileDto);
        return { token, profile, user };

    }

    async getAllProfiles() {
        const users = await this.profileRepository.findAll();
        return users;
    }

    async getById(id: number) {
        const profile = await this.profileRepository.findByPk(id, { include: { all: true } });
        return profile;
    }

    async update(id: number, newProfile: ProfileDto) {
        return this.profileRepository.update(newProfile, { where: { id } });
    }

    async delete(id: number) {
        return this.profileRepository.destroy({ where: { id } });
    }

}