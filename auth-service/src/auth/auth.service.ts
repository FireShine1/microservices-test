import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from "../auth/dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'
import { User } from "./auth.model";
import { InjectModel } from '@nestjs/sequelize';
import { RolesService } from 'src/roles/roles.service';
import ChannelWrapper from 'amqp-connection-manager/dist/esm/ChannelWrapper';

@Injectable()
export class AuthService {
    channel: ChannelWrapper;

    constructor(@InjectModel(User) private userRepository: typeof User,
        private roleService: RolesService,
        private jwtService: JwtService) {}

    async login(userDto: CreateUserDto) {
        //проверяем введеные данные
        const user = await this.validateUser(userDto)
        //если все правильно, генерируем токен
        return this.generateToken(user)
    }

    //регистрируем юзера
    async register(userDto: CreateUserDto) {
        //проверяем, не зарегистрирован ли уже юзер с таким же email
        const candidate = await this.getUserByEmail(userDto.email);
        //если зарегистрирован, то бросаем ошибку
        if (candidate) {
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
        }
        //иначе хешируем пароль
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        //регистрируем юзера
        const user = await this.createUser({ ...userDto, password: hashPassword })
        //и создаем токен авторизации
        const token = await this.generateToken(user);
        return { token: token, user: user };
    }

    private async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        //по умолчанию даем юзеру роль пользователя
        const role = await this.roleService.getRoleByValue("USER");
        await user.$set('roles', [role.id]);
        user.roles = [role];
        return user;
    }

    private async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email }, include: { all: true } });
        return user;
    }

    private async generateToken(user: User) {
        //в токен кладем полезную информацию о юзере: роли, айдишник и email
        const payload = { email: user.email, id: user.id, roles: user.roles }
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.getUserByEmail(userDto.email);
        //если юзер не найдет, то с таким email никто не зарегистрирован
        if (!user) {
            throw new UnauthorizedException({ message: 'Пользователя с таким email не существует' });
        }
        //сверяем пароли
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        //если все правильно, то возвращаем юзера из бд
        if (user && passwordEquals) {
            return user;
        }
        //иначе кидаем ошибку
        throw new UnauthorizedException({ message: 'Некорректный email или пароль' });
    }

}