import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BaseEntity } from 'src/common/mysql/base.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { InfoUser } from './entities/infoUser.entity';
import { Roles } from 'src/auth/entities/role.entity';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';
import { AuthService } from 'src/auth/auth.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RoleFunction } from 'src/auth/entities/RoleFunction.entity';
import { Functions } from 'src/auth/entities/function.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, InfoUser, Roles, RoleFunction, Functions]),
    
    
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService, AuthService ],
})
export class UsersModule {}
