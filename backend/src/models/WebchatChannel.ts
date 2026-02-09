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
import Company from "./Company";
import Queue from "./Queue";
import AIAgent from "./AIAgent";
import WebchatSession from "./WebchatSession";

@Table
class WebchatChannel extends Model<WebchatChannel> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Default(true)
    @Column
    isActive: boolean;

    // Visual customization
    @Default("#6366f1")
    @Column(DataType.STRING)
    primaryColor: string;

    @Default("bottom-right")
    @Column(DataType.STRING)
    position: string; // 'bottom-right' | 'bottom-left'

    @Column(DataType.TEXT)
    welcomeMessage: string;

    @Column(DataType.TEXT)
    offlineMessage: string;

    @Column(DataType.STRING)
    avatarUrl: string;

    @Column(DataType.STRING)
    buttonText: string;

    // Security - allowed domains for embedding
    @Default("[]")
    @Column(DataType.JSON)
    allowedDomains: string[];

    // Integration with existing systems
    @ForeignKey(() => AIAgent)
    @Column
    aiAgentId: number;

    @BelongsTo(() => AIAgent)
    aiAgent: AIAgent;

    @ForeignKey(() => Queue)
    @Column
    queueId: number;

    @BelongsTo(() => Queue)
    queue: Queue;

    // Multi-tenant
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column
    tenantId: number;

    @BelongsTo(() => Company)
    company: Company;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => WebchatSession)
    sessions: WebchatSession[];
}

export default WebchatChannel;
