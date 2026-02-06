import {
    Table,
    Column,
    CreatedAt,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    ForeignKey,
    BelongsTo
} from "sequelize-typescript";
import WebchatSession from "./WebchatSession";
import User from "./User";

@Table
class WebchatMessage extends Model<WebchatMessage> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => WebchatSession)
    @AllowNull(false)
    @Column
    sessionId: number;

    @BelongsTo(() => WebchatSession)
    session: WebchatSession;

    @AllowNull(false)
    @Column(DataType.TEXT)
    body: string;

    // Who sent the message
    @AllowNull(false)
    @Column(DataType.STRING)
    sender: string; // 'visitor' | 'agent' | 'bot'

    // Agent who sent (if sender is 'agent')
    @ForeignKey(() => User)
    @Column
    agentId: number;

    @BelongsTo(() => User)
    agent: User;

    // Read status
    @Column
    isRead: boolean;

    @CreatedAt
    createdAt: Date;
}

export default WebchatMessage;
