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
    BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import ContactFormResponse from "./ContactFormResponse";
import ContactFormField from "./ContactFormField";

@Table
class ContactFormResponseValue extends Model<ContactFormResponseValue> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => ContactFormResponse)
    @Column
    responseId: number;

    @BelongsTo(() => ContactFormResponse)
    response: ContactFormResponse;

    @ForeignKey(() => ContactFormField)
    @Column
    fieldId: number;

    @BelongsTo(() => ContactFormField)
    field: ContactFormField;

    @Column(DataType.TEXT)
    value: string;

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

export default ContactFormResponseValue;
