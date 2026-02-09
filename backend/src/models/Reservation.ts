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
    Default,
    AllowNull
} from "sequelize-typescript";
import Company from "./Company";
import Contact from "./Contact";
import User from "./User";
import Ticket from "./Ticket";

@Table
class Reservation extends Model<Reservation> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column
    title: string;

    @Column(DataType.TEXT)
    description: string;

    @AllowNull(false)
    @Column
    startDate: Date;

    @AllowNull(false)
    @Column
    endDate: Date;

    @Default("pending")
    @Column(DataType.ENUM("pending", "confirmed", "completed", "cancelled"))
    status: "pending" | "confirmed" | "completed" | "cancelled";

    @Column(DataType.TEXT)
    notes: string;

    @Default("#2576d2")
    @Column
    color: string;

    @ForeignKey(() => Contact)
    @Column
    contactId: number;

    @BelongsTo(() => Contact)
    contact: Contact;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;

    @BelongsTo(() => Ticket)
    ticket: Ticket;

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

export default Reservation;
