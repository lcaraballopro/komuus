import Whatsapp from "../../models/Whatsapp";
import { StartWhatsAppSession } from "./StartWhatsAppSession";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  // At system startup, we need to start all whatsapp sessions across all tenants
  const whatsapps = await Whatsapp.findAll();
  if (whatsapps.length > 0) {
    whatsapps.forEach(whatsapp => {
      StartWhatsAppSession(whatsapp);
    });
  }
};

