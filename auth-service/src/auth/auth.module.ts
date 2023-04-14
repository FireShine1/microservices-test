import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import {JwtModule} from "@nestjs/jwt";
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './auth.model';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { RolesModule } from 'src/roles/roles.module';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
      SequelizeModule.forFeature([User, Role, UserRoles]),
	  forwardRef(() => RolesModule),
      JwtModule.register({
        secret: process.env.PRIVATE_KEY || 'SECRET',
        signOptions: {
          expiresIn: '24h'
        }
      })
  ],
    exports: [
        AuthService,
        JwtModule
    ]
})
export class AuthModule {};