import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    BelongsToMany
} from "sequelize-typescript";
import Role from "./Role";
import RolePermission from "./RolePermission";

@Table
class Permission extends Model<Permission> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    key: string;

    @Column
    name: string;

    @Column
    description: string;

    @Column
    module: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsToMany(() => Role, () => RolePermission)
    roles: Role[];
}

export default Permission;
