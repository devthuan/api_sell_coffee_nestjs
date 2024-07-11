import { IsEmail, IsIP, IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {

    @IsNotEmpty()
    oldPassword: string

    @IsString()
    @MinLength(6)
    newPassword1: string
    
    @IsString()
    @MinLength(6)
    newPassword2: string

    
}
