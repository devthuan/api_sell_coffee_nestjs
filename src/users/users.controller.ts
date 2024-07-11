import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("register")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("sortBy") sortBy: string = "createdAt",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "DESC"
  ) {
    limit = limit > 100 ? 100 : limit;
    sortOrder.toUpperCase()
    return this.usersService.findAll(page, limit, sortBy, sortOrder);
  }
 
  @UseGuards(AuthGuard)
  @Get('deleted')
  findAllDeleted(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("sortBy") sortBy: string = "createdAt",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "DESC"
  ) {
    limit = limit > 100 ? 100 : limit;
    sortOrder.toUpperCase()
    return this.usersService.findAllDeleted(page, limit, sortBy, sortOrder);
  }

  @Get('search')
  searchByEmail(
    @Query("email") email: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("sortBy") sortBy: string = "createdAt",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "DESC"
  ) {
    return this.usersService.searchByEmail(email, page, limit, sortBy, sortOrder);
  }



  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log(updateUserDto); 
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('change-status/:id')
  changeStatusUser(@Param("id") id: string) {
    return this.usersService.changeStatusUser(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteSoft(@Param('id') id: string) {
    return this.usersService.deleteSoft(id);
  }

  @UseGuards(AuthGuard)
  @Patch('recover/:id')
  recover(@Param('id') id: string) {
    return this.usersService.recover(id);
  }
}
