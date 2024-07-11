import { BaseEntity } from "src/common/mysql/base.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { RoleFunction } from "./RoleFunction.entity";

@Entity({name: "functions"})
export class Functions extends BaseEntity {
    
    @Column()
    code: string

    @Column()
    name: string

    @Column({
        name: "is_active",
    })
    isActive: boolean

    @OneToMany(() => RoleFunction, roleFunction => roleFunction.id)
    roleFunction: RoleFunction;
    
} 
 