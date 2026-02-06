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
import ContactFormField from "./ContactFormField";
import ContactFormResponse from "./ContactFormResponse";
import Whatsapp from "./Whatsapp";

@Table
class ContactForm extends Model<ContactForm> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column(DataType.TEXT)
    description: string;

    @Default(true)
    @Column
    isActive: boolean;

    @ForeignKey(() => Company)
    @Column
    tenantId: number;

    @BelongsTo(() => Company)
    company: Company;

    @ForeignKey(() => Whatsapp)
    @Column
    whatsappId: number;

    @BelongsTo(() => Whatsapp)
    whatsapp: Whatsapp;

    @HasMany(() => ContactFormField)
    fields: ContactFormField[];

    @HasMany(() => ContactFormResponse)
    responses: ContactFormResponse[];

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default ContactForm;
