import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
    ForeignKey,
    BelongsTo,
    DataType
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Lead extends Model<Lead> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @AllowNull(true)
    @Column
    email: string;

    @AllowNull(true)
    @Column
    phone: string;

    @AllowNull(true)
    @Column
    sessionId: string;

    @Default("landing-chat")
    @Column
    source: string;

    @Default("new")
    @Column
    status: string;

    @AllowNull(true)
    @Column(DataType.JSONB)
    metadata: object;

    @ForeignKey(() => Company)
    @Column
    tenantId: number;

    @BelongsTo(() => Company)
    company: Company;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default Lead;
