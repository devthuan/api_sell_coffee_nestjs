import { BaseEntity } from "src/common/mysql/base.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Functions } from "./function.entity";
import { Roles } from "./role.entity";
import { User } from "src/users/entities/user.entity";

@Entity({name: "role_function"})
export class RoleFunction extends BaseEntity {
    
    @ManyToOne(() => User, user => user.id )
    user: User[]

    @ManyToOne(() => Roles, role => role.id)
    role: Roles[]
    
    @ManyToOne(() => Functions, func => func.id)
    function: Functions[]

    @Column({name: "is_active"})
    isActive: string
    
} 
 