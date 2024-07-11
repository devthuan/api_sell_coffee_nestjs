import { BaseEntity } from "src/common/mysql/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";


@Entity({name: "info_user"})
export class InfoUser extends BaseEntity {

    @Column({name: "full_name"})
    fullName: string

    @Column({name: "gender"})
    gender: string
    
    @Column({name: "birth_day"})
    birthDay: Date
    
    @Column({name: "address_delivery"})
    addressDelivery: string

    @OneToOne(()=> User, user => user.infoUser )
    @JoinColumn()
    user: User

  


}
