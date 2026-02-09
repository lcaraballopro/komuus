import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import AIAgent from "../models/AIAgent";
import Company from "../models/Company";
import Lead from "../models/Lead";
import Role from "../models/Role";
import Permission from "../models/Permission";
import RolePermission from "../models/RolePermission";
import PushSubscription from "../models/PushSubscription";
import ContactForm from "../models/ContactForm";
import ContactFormField from "../models/ContactFormField";
import ContactFormResponse from "../models/ContactFormResponse";
import ContactFormResponseValue from "../models/ContactFormResponseValue";
import WebchatChannel from "../models/WebchatChannel";
import WebchatSession from "../models/WebchatSession";
import WebchatMessage from "../models/WebchatMessage";
import CloseReason from "../models/CloseReason";
import Reservation from "../models/Reservation";
import TelephonyChannel from "../models/TelephonyChannel";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  Company,
  Role,
  Permission,
  RolePermission,
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  AIAgent,
  Lead,
  PushSubscription,
  ContactForm,
  ContactFormField,
  ContactFormResponse,
  ContactFormResponseValue,
  WebchatChannel,
  WebchatSession,
  WebchatMessage,
  CloseReason,
  Reservation,
  TelephonyChannel
];

sequelize.addModels(models);

export default sequelize;
