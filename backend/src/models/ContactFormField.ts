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
    Default
} from "sequelize-typescript";
import Company from "./Company";
import ContactForm from "./ContactForm";

@Table
class ContactFormField extends Model<ContactFormField> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => ContactForm)
    @Column
    formId: number;

    @BelongsTo(() => ContactForm)
    form: ContactForm;

    @Default("text")
    @Column
    type: string; // text, textarea, select, checkbox, date, email, phone, number

    @Column
    label: string;

    @Column
    placeholder: string;

    @Column(DataType.JSONB)
    options: string[]; // For select fields: ["Option 1", "Option 2", ...]

    @Default(false)
    @Column
    isRequired: boolean;

    @Default(0)
    @Column
    order: number;

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

export default ContactFormField;
