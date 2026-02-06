import {
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    HasMany,
    Default
} from "sequelize-typescript";
import Company from "./Company";
import ContactForm from "./ContactForm";

@Table
class CloseReason extends Model<CloseReason> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column(DataType.TEXT)
    description: string;

    @Column(DataType.ENUM("positive", "negative"))
    category: "positive" | "negative";

    @Column({ defaultValue: "#9e9e9e" })
    color: string;

    @Default(true)
    @Column
    isActive: boolean;

    @Default(0)
    @Column
    order: number;

    @ForeignKey(() => ContactForm)
    @Column
    formId: number;

    @BelongsTo(() => ContactForm)
    form: ContactForm;

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

export default CloseReason;
