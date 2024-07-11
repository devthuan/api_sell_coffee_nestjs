import { BaseEntity } from "src/common/mysql/base.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { InfoUser } from "./infoUser.entity";
import { Roles } from "src/auth/entities/role.entity";
import { RoleFunction } from "src/auth/entities/RoleFunction.entity";

@Entity()
export class User extends BaseEntity {

    @Column({unique: true})
    email: string
    
    
    @Column()
    phone: string

    @Column()
    password: string

    @Column()
    ip: string
    
    @Column({
        default: 0
    })
    balance: number

    @ManyToOne( () => Roles, role => role.id)
    role: Roles

    @OneToOne(()=> InfoUser, infoUser => infoUser.user)
    infoUser: InfoUser


    @Column({
        default: false,
        name: "is_active",
    })
    isActive: boolean

    @Column({
        name: "type_login",
        default: "system"
    })
    typeLogin: string


    @Column({
        default: null,
        name: "last_login",
    })
    lastLogin: Date

    @OneToMany( () => RoleFunction, roleFunction => roleFunction.id )
    roleFunction: RoleFunction
  newUser: RoleFunction;

  


}
