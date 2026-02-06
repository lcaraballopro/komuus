import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    Default,
    Unique,
    HasMany
} from "sequelize-typescript";
import User from "./User";
import Whatsapp from "./Whatsapp";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Queue from "./Queue";
import QuickAnswer from "./QuickAnswer";
import AIAgent from "./AIAgent";

@Table
class Company extends Model<Company> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Unique
    @Column
    slug: string;

    @Default("basic")
    @Column
    plan: string;

    @Default(true)
    @Column
    isActive: boolean;

    @Default(10)
    @Column
    maxUsers: number;

    @Default(2)
    @Column
    maxWhatsapps: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => User)
    users: User[];

    @HasMany(() => Whatsapp)
    whatsapps: Whatsapp[];

    @HasMany(() => Contact)
    contacts: Contact[];

    @HasMany(() => Ticket)
    tickets: Ticket[];

    @HasMany(() => Queue)
    queues: Queue[];

    @HasMany(() => QuickAnswer)
    quickAnswers: QuickAnswer[];

    @HasMany(() => AIAgent)
    aiAgents: AIAgent[];
}

export default Company;
