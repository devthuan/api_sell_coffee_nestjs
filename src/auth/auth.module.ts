import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleFunction } from './entities/RoleFunction.entity';
import { Functions } from './entities/function.entity';
import { Roles } from './entities/role.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  
    PassportModule.register({defaultStrategy: 'google'}),
    TypeOrmModule.forFeature([Roles, Functions, RoleFunction, User])
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule {}
