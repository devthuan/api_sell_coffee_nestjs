import { IsEmail, IsIP, IsNumber, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {

    constructor(){
        this.isActive = false;
        this.role = "3";
    }

    
    @IsEmail() 
    email: string;

    @IsString()
    @MaxLength(10)
    @MinLength(10)
    phone : string;

    @IsString()
    @MinLength(6)
    password : string;
    
    @IsIP()
    ip: string;

    isActive : boolean;

    role: string;
    
    


}
