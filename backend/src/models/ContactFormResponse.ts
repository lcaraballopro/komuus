import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    HasMany
} from "sequelize-typescript";
import Company from "./Company";
import ContactForm from "./ContactForm";
import Ticket from "./Ticket";
import Contact from "./Contact";
import User from "./User";
import ContactFormResponseValue from "./ContactFormResponseValue";

@Table
class ContactFormResponse extends Model<ContactFormResponse> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => ContactForm)
    @Column
    formId: number;

    @BelongsTo(() => ContactForm)
    form: ContactForm;

    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;

    @BelongsTo(() => Ticket)
    ticket: Ticket;

    @ForeignKey(() => Contact)
    @Column
    contactId: number;

    @BelongsTo(() => Contact)
    contact: Contact;

    @ForeignKey(() => User)
    @Column
    submittedBy: number;

    @BelongsTo(() => User)
    submitter: User;

    @HasMany(() => ContactFormResponseValue)
    values: ContactFormResponseValue[];

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

export default ContactFormResponse;
