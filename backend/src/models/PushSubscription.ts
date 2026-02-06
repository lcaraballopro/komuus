import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
    DataType
} from "sequelize-typescript";
import User from "./User";

@Table
class PushSubscription extends Model<PushSubscription> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @Column(DataType.TEXT)
    endpoint: string;

    @Column(DataType.TEXT)
    p256dh: string;

    @Column(DataType.TEXT)
    auth: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default PushSubscription;
