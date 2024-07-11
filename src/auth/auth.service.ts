import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MailService } from 'src/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository  } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RoleFunction } from './entities/RoleFunction.entity';
import { Functions } from './entities/function.entity';
import { LoginGoogle } from './auth.interface';
import { Roles } from './entities/role.entity';

@Injectable()
export class AuthService {

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    @InjectRepository(RoleFunction)
    private readonly roleFunctionRepository: Repository<RoleFunction>,
    @InjectRepository(Functions)
    private readonly functionsRepository: Repository<Functions>,

    private mailService: MailService,
    private jwtService: JwtService

  ){}

  async login(loginDto: LoginDto): Promise<any>{

    try {
      
      const user = await this.userRepository.findOne({where: { email: loginDto.email }});

      if(!user){
        return {
          statusCode: 401,
          status: "error",
          message: "Your account does not exist."
        }
      }

      if(user.isActive === false) {
        return {
          statusCode: 401,
          status: "error",
          message: "Account is not active or blocked."
        }
      }

      const isMatch = await this.comparePassword(loginDto.password, user.password);

      if(!isMatch){
        return {
          statusCode: 401,
          status: "error",
          message: "Incorrect password."
        }
      }else {

        const payload = {
          id: user.id,
          email: user.email,
          ip: user.ip,
          last_login: user.lastLogin,
          role: user.role,
        }

        const token = await this.jwtService.signAsync(payload)


        user.lastLogin = new Date();
        user.ip = loginDto.ip
        await this.userRepository.save(user);

        return {
          statusCode: 200,
          status: "success",
          message: "Login successful",
          token: token
        } 
      }

    } catch (error) {
      throw new Error(error)
    }

   
  }

  async loginWithGoogle(user : LoginGoogle) : Promise<any> {
    try {
      const userExist = await this.userRepository.findOne({ where: { email: user.email }});
      if(userExist){
        const payload = {
            id: userExist.id,
            email: userExist.email,
            ip: userExist.ip,
            last_login: userExist.lastLogin,
            role: userExist.role,
          }
  
          const token = await this.jwtService.signAsync(payload)
  
  
          userExist.lastLogin = new Date();
          userExist.typeLogin = 'google'
          userExist.ip = '0.0.0.0'
          await this.userRepository.save(userExist);
  
          return {
            statusCode: 200,
            status: "success",
            message: "Login successful",
            token: token
          } 
      }else {
        const newUser = new User();
        newUser.email = user.email;
        newUser.password = await this.hashingPassword(this.generatePassword());
        newUser.ip = '0.0.0.0';
        newUser.typeLogin = 'google'
        newUser.isActive = true;
        newUser.role = await this.rolesRepository.findOne({ where: { id: "2" }}); // client role
        newUser.lastLogin = new Date();
        newUser.typeLogin = 'google';
        newUser.phone = '0945986661';
        await this.userRepository.save(newUser);
        
        const payload = {
          id: newUser.id,
          email: newUser.email,
          ip: newUser.ip,
          last_login: newUser.lastLogin,
          role: newUser.role, // client role
        }
        const token = await this.jwtService.signAsync(payload)
        return {
          statusCode: 200,
          status: "success",
          message: "Login successful",
          token: token
        } 
      }
      
    } catch (error) {
      throw new Error(error)
    }
  }

  async changePassword(id: string, oldPassword: string, newPassword: string){
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await this.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return {
        statusCode: 401,
        status: "error",
        message: "Incorrect password."
      }
    }
    user.password = await this.hashingPassword(newPassword);
    user.updatedAt = new Date();
    await this.userRepository.save(user);
    return {
      statusCode: 200,
      status:'success',
      message: 'Change password successful',
    }
  }

  async forgotPassword(email: string) {
    const user : User = await this.userRepository.findOne({where : { email: email }});
    if (!user) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'Account not found.',
      }
    }
    const newPassword : string =  this.generatePassword();
    await this.mailService.sendEmail(
        user.email,
        'your new Password',
        newPassword,
        newPassword,
    )  

    user.password = await this.hashingPassword(newPassword);
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      statusCode: 200,
      status:'success',
      message: 'New password sent to your email.',
    }

  }


  async getRolePermissions(id: string) {
    const listPermissions = await this.roleFunctionRepository.createQueryBuilder('roleFunction')
    .leftJoinAndSelect('roleFunction.role', 'role')
    .leftJoinAndSelect('roleFunction.function', 'function')
    .leftJoinAndSelect('roleFunction.user', 'user')
    .where('user.id = :id', { id })
    .select([
            'roleFunction.id',
            'role.id',
            'role.name',
            'function.id',
            'function.name',
            'user.id',
            'user.email',
        ])
    .getMany();

    return {
      statusCode: 200,
      status:'success',
      message: 'Permissions retrieved successfully.',
      data: listPermissions,
    };
  }



  async hashingPassword(password: string): Promise<string> { 
    const salt = 10
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async comparePassword(originPassword: string, hashingPassword: string): Promise<boolean> {
    return await bcrypt.compare(originPassword, hashingPassword);
  }

   generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

   generatePassword(): string {
    const password = Math.random().toString(36).substr(2, 10);
    return password;
  }

  async sendOTP(email: string) {
      const otp =  this.generateOTP();
      const otpHash = await this.hashingPassword(otp)
      await this.cacheManager.set(email, otpHash, {ttl: 300})

       await this.mailService.sendEmail(
        email,
        "Mã OTP",
        otp,
        otp
      )
      return {
        statusCode: 200,
        status: "success",
        message: "Mã OTP đã được gửi tới email của bạn"
      }
  }

  async verifyOTP(otp: string, email: string): Promise<any> {
    try {
      const cachedOtp = await this.cacheManager.get(email);
      if (!cachedOtp) {
        return {
          statusCode: 400,
          status: "fail",
          message: "Mã OTP không hợp lệ"
        };
      }

    let checkOTP  = await this.comparePassword(otp, cachedOtp);
    if (!checkOTP) {

      return {
        statusCode: 400,
        status: "fail",
        message: "Mã OTP không chính xác"
      }
    } else {

      const users = await this.userRepository.findOne({where: {email: email}});
    
      users.isActive = true;
  
      await this.userRepository.save(users);
     

      await this.cacheManager.del(email);

      return {
        statusCode: 200,
        status: "success",
        message: "Mã OTP hợp, user đã được xác thực"
      }
    }

    } catch (error) {
      throw new Error(error)
    }
    
  }

 

  

}
