import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MessagePattern } from "@nestjs/microservices";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller()
export class AuthController {
    constructor(private authService: AuthService) {}

    @MessagePattern("register-request")
    register(userDto: CreateUserDto) {
        return this.authService.register(userDto);
    }

    @MessagePattern("login-request")
    login(userDto: CreateUserDto) {
        return this.authService.login(userDto);
    }

}