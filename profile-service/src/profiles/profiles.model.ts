import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";

interface ProfileCreationAttrs {
    name: string;
    middleName: string;
    lastName: string;
    description: string;
    phoneNumber: string;
}

@Table({tableName: 'profiles'})
export class Profile extends Model<Profile, ProfileCreationAttrs> {

    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @Column({type: DataType.STRING, allowNull: false})
    name: string;

    @Column({type: DataType.STRING})
    middleName: string;

    @Column({type: DataType.STRING, allowNull: false})
    lastName: string;

    @Column({type: DataType.STRING})
    description: string;

    @Column({type: DataType.STRING})
    phoneNumber: string;
}