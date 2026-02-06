import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  tenantId: number;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  extraInfo = [],
  tenantId
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({ where: { number, tenantId } });

  if (contact) {
    contact.update({ profilePicUrl });

    io.to(`tenant:${tenantId}`).emit("contact", {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      extraInfo,
      tenantId
    });

    io.to(`tenant:${tenantId}`).emit("contact", {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;

