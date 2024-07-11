import { FindOptionsOrder, Repository } from "typeorm";
import { BaseEntity } from "./base.entity";
import { NotFoundException } from "@nestjs/common";


export class BaseService<Entity> {
    constructor(
        protected repo: Repository<Entity>
    ){}

  async findAll(page: number, limit: number,sortBy : string, sortOrder : string ) {

    const [result, total] = await this.repo.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sortBy]: sortOrder as 'ASC' | 'DESC'
      } as FindOptionsOrder<Entity>
    });
    const totalPages = Math.ceil(total / limit);

   

    return {
      code: 200,
      status:'success',
      message: 'Get data successful',
      total: total,
      totalPages: totalPages,
      data: result,
    }
  }

  async findOne(id: string) : Promise<Entity>  {
    const entity = await this.repo.findOne(id as any);
    if(!entity){
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  // update(id: number, updateAuthDto: any) {
  //   return `This action updates a #${id} auth`;
  // }

  async remove(id: number) {
    let entity = await this.repo.findOne(id as any);
    if(!entity){
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    (entity as any).deletedAt = new Date();
    await this.repo.save(entity);
  }


}