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
import Whatsapp from "./Whatsapp";
import Company from "./Company";

@Table
class AIAgent extends Model<AIAgent> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column
    name: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    webhookUrl: string;

    @AllowNull(true)
    @Column
    apiToken: string;

    @Default(true)
    @Column
    isActive: boolean;

    @ForeignKey(() => Company)
    @Column
    tenantId: number;

    @BelongsTo(() => Company)
    company: Company;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => Whatsapp)
    whatsapps: Whatsapp[];
}

export default AIAgent;
