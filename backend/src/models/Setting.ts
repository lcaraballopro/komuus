import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Setting extends Model<Setting> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  key: string;

  @Column
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

export default Setting;
