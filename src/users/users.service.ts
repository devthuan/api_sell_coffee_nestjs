import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Code, Repository } from 'typeorm';
import { Roles } from 'src/auth/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { BaseService } from 'src/common/mysql/base.service';
import { AuthService } from 'src/auth/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InfoUser } from './entities/infoUser.entity';
import { isNull } from 'util';


interface ResponsesAPI {
    statusCode: number;
    status: string;
    message: string;
    total?: number;
    totalPages?: number;
    data?: any;

}


@Injectable()
export class UsersService  {
  
  

  constructor(

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(InfoUser)
    private readonly infoUserRepository: Repository<InfoUser>,
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,

    private readonly mailService: MailService,
    private readonly authService: AuthService

  ) {
  }
  
  async create(createUserDto: CreateUserDto) {
    
    try {

      let role = await this.roleRepository.findOne({where: {id: createUserDto.role}});
        if (!role) {
          return {
            statusCode: 404,
            status: 'error',
            message: 'Role not found',
          }
        }

      const new_user = this.userRepository.create({
        email : createUserDto.email,
        phone : createUserDto.phone,
        password :  await this.authService.hashingPassword(createUserDto.password),
        ip : createUserDto.ip,
        isActive : createUserDto.isActive,
        role : role,
      })
      
      await this.userRepository.save(new_user);

      const otp = await this.authService.generateOTP();
      const otpHash = await this.authService.hashingPassword(otp)
      await this.cacheManager.set(new_user.email, otpHash, 3000)
      
       await this.mailService.sendEmail(
        new_user.email,
        "Mã OTP",
        otp,
        otp
      )

      return {
        statusCode: 200,
        status: 'success',
        message: 'Create user success',
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return {
          statusCode: 400,
          status: 'error',
          message: 'Email or number phone already exists',
        }
      }
      throw new Error(error);
    }
    
  }

  async findAll(page: number, limit: number,sortBy : string, sortOrder : string ) {

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const [result, total] = await queryBuilder
      .where('user.deletedAt IS NULL')
      .orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
      

    const totalPages = Math.ceil(total / limit);

    let filteredUsers = result.map((user) => {
      delete user.password
      return user;
    })

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users successful',
      total: total,
      totalPages: totalPages,
      currentPage: page,
      data: filteredUsers,
    }
  }

  async findAllDeleted(page: number, limit: number,sortBy : string, sortOrder : string ) {

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const [result, total] = await queryBuilder
      .where('user.deletedAt IS NOT NULL')
      .orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
      

    const totalPages = Math.ceil(total / limit);

    let filteredUsers = result.map((user) => {
      delete user.password
      return user;
    })

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users successful',
      total: total,
      totalPages: totalPages,
      currentPage: page,
      data: filteredUsers,
    }
  }

  async findOne(id: string) : Promise<{statusCode : number, status: string, message: string, data: Partial<User>}> {
    const user = await this.userRepository.findOne({
      where : {id},
      relations: ['infoUser', 'role']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

     const { password, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      status:'success',
      message: 'Get user successful',
      data: userWithoutPassword,
    }

  }

  async searchByEmail(email : string, page: number, limit: number,sortBy : string, sortOrder : string ) {
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const [result, total] = await queryBuilder
      .where(
          `user.email LIKE :email && user.deletedAt IS NULL`, { email: `${email}%` }

      )
      .orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
      

    const totalPages = Math.ceil(total / limit);

    let filteredUsers = result.map((user) => {
      delete user.password
      return user;
    })

    return {
      statusCode: 200,
      status:'success',
      message: 'Get users successful',
      total: total,
      totalPages: totalPages,
      data: filteredUsers,
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.infoUser', 'infoUser')
      .getOne();

      if (user.infoUser === null) {
        const new_infoUser =  this.infoUserRepository.create({
          user: user,
          fullName: updateUserDto.fullName,
          gender: updateUserDto.gender,
          birthDay: updateUserDto.birthDay,
          addressDelivery: updateUserDto.addressDelivery,
          createdAt: new Date()
        })
        await this.infoUserRepository.save(new_infoUser);
      }else {
        user.infoUser.fullName = updateUserDto.fullName;
        user.infoUser.gender = updateUserDto.gender;
        user.infoUser.birthDay = updateUserDto.birthDay;
        user.infoUser.addressDelivery = updateUserDto.addressDelivery;
        user.infoUser.updatedAt = new Date();
        await this.infoUserRepository.save(user.infoUser);
      }
      
      return {
        statusCode: 200,
        status:'success',
        message: 'Update user success',
      }
      
    } catch (error) {
      throw new Error(error)
    }

  }

  async changeStatusUser(userId:string) {
    const user = await this.userRepository.findOne({where: {id: userId}})
    if (!user) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
      }
    }

    user.isActive =!user.isActive;
    await this.userRepository.save(user);
    
    return {
      statusCode: 200,
      status:'success',
      message: user.isActive? 'User activated' : 'User deactivated',
    }

  }

  async deleteSoft(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deletedAt = new Date();
    await this.userRepository.save(user);

    return {
      statusCode: 200,
      status:'success',
      message: 'Delete user success',
    }
  }

  async recover(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deletedAt = null;
    await this.userRepository.save(user);

    return {
      statusCode: 200,
      status:'success',
      message: 'recover user success',
    }
  }

  


}
