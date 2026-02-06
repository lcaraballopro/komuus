import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    Default,
    HasMany,
    BelongsToMany
} from "sequelize-typescript";
import Permission from "./Permission";
import RolePermission from "./RolePermission";
import User from "./User";

@Table
class Role extends Model<Role> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column
    description: string;

    @Default(false)
    @Column
    isSystem: boolean;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsToMany(() => Permission, () => RolePermission)
    permissions: Permission[];

    @HasMany(() => User)
    users: User[];
}

export default Role;
