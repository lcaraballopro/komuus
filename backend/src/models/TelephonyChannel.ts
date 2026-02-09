import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Default,
    AllowNull,
    HasMany,
    ForeignKey,
    BelongsTo
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import Company from "./Company";

@Table
class TelephonyChannel extends Model<TelephonyChannel> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    // SIP Credentials
    @AllowNull(false)
    @Column(DataType.STRING)
    trunkUsername: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    trunkPassword: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    trunkDomain: string;

    @Default(5060)
    @Column(DataType.INTEGER)
    trunkPort: number;

    @Default("default")
    @Column(DataType.STRING)
    context: string;

    @Default(true)
    @Column
    isActive: boolean;

    // Default queue for incoming calls
    @ForeignKey(() => Queue)
    @Column
    queueId: number;

    @BelongsTo(() => Queue)
    queue: Queue;

    // Multi-tenant
    @ForeignKey(() => Company)
    @Column
    tenantId: number;

    @BelongsTo(() => Company)
    company: Company;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => Ticket)
    tickets: Ticket[];
}

export default TelephonyChannel;
