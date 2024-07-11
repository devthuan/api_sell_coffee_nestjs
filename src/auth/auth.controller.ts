import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
// import { AuthGuard } from './auth.guard';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginGoogle } from './auth.interface';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  create(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  verifyOTP(@Body("otp") otp: string, @Body("email") email: string) {
    return this.authService.verifyOTP(otp, email);
   
  }
  @Post('send-otp')
  sendOTP(@Body("email") email: string) {
    return this.authService.sendOTP(email);
   
  }
  // @UseGuards(AuthGuard)
  @Post('change-password')
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    if (changePasswordDto.newPassword1 !== changePasswordDto.newPassword2){
      return {
        statusCode: 400,
        status: "error",
        message: "the new passwords do not match."
      }
    }
    return this.authService.changePassword(req.user.id, changePasswordDto.oldPassword, changePasswordDto.newPassword1);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto : ForgotPasswordDto){
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  // @UseGuards(AuthGuard)
  @Get('permission')
  getRolePermissions(@Req() req) {
    const userId = req.user.id;

    return this.authService.getRolePermissions(userId);
  }
  
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    console.log(req)
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    // redirect to home page
    let infoUser : LoginGoogle = req.user
    return this.authService.loginWithGoogle(infoUser)
   
  }
 
}
