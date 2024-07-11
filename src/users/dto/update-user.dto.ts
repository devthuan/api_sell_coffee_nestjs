import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsEmpty, IsOptional, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional()
    @IsString()
    fullName?: string

    @IsOptional()
    gender?: string

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    birthDay?: Date
    
    @IsOptional()
    @IsString()
    addressDelivery?: string


}
