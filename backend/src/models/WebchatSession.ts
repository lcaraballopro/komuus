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
    ForeignKey,
    BelongsTo,
    HasMany
} from "sequelize-typescript";
import WebchatChannel from "./WebchatChannel";
import WebchatMessage from "./WebchatMessage";
import Contact from "./Contact";
import Ticket from "./Ticket";

@Table
class WebchatSession extends Model<WebchatSession> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => WebchatChannel)
    @AllowNull(false)
    @Column
    channelId: number;

    @BelongsTo(() => WebchatChannel)
    channel: WebchatChannel;

    // Unique token for visitor identification
    @AllowNull(false)
    @Column(DataType.UUID)
    sessionToken: string;

    // Optional visitor info (collected via form or conversation)
    @Column(DataType.STRING)
    visitorName: string;

    @Column(DataType.STRING)
    visitorEmail: string;

    @Column(DataType.STRING)
    visitorPhone: string;

    // Tracking
    @Column(DataType.STRING)
    ipAddress: string;

    @Column(DataType.TEXT)
    userAgent: string;

    @Column(DataType.STRING)
    referrerUrl: string;

    // Status
    @Default("active")
    @Column(DataType.STRING)
    status: string; // 'active' | 'closed'

    // Link to Contact if identified
    @ForeignKey(() => Contact)
    @Column
    contactId: number;

    @BelongsTo(() => Contact)
    contact: Contact;

    // Link to Ticket when escalated to agent
    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;

    @BelongsTo(() => Ticket)
    ticket: Ticket;

    @Column
    lastActivityAt: Date;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => WebchatMessage)
    messages: WebchatMessage[];
}

export default WebchatSession;
