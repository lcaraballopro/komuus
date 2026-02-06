import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    ForeignKey,
    BelongsTo,
    PrimaryKey,
    AutoIncrement
} from "sequelize-typescript";
import Role from "./Role";
import Permission from "./Permission";

@Table
class RolePermission extends Model<RolePermission> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Role)
    @Column
    roleId: number;

    @ForeignKey(() => Permission)
    @Column
    permissionId: number;

    @BelongsTo(() => Role)
    role: Role;

    @BelongsTo(() => Permission)
    permission: Permission;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default RolePermission;
