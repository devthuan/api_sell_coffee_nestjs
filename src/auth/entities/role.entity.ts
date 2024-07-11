import { BaseEntity } from "src/common/mysql/base.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { RoleFunction } from "./RoleFunction.entity";
import { User } from "src/users/entities/user.entity";

@Entity({name: "roles"})
export class Roles extends BaseEntity {
    
    @Column()
    name: string

    @Column()
    description: string

    @OneToMany( () => User, user => user.id )
    users: User[]

    @OneToMany(() => RoleFunction, roleFunction => roleFunction.id)
    roleFunction: RoleFunction
}
 