import ContactForm from "../../models/ContactForm";
import ContactFormField from "../../models/ContactFormField";
import AppError from "../../errors/AppError";

interface Request {
    id: string | number;
    tenantId: number;
}

const ShowContactFormService = async ({
    id,
    tenantId
}: Request): Promise<ContactForm> => {
    const contactForm = await ContactForm.findOne({
        where: { id, tenantId },
        include: [
            {
                model: ContactFormField,
                as: "fields",
                separate: true,
                order: [["order", "ASC"]]
            }
        ]
    });

    if (!contactForm) {
        throw new AppError("ERR_NO_CONTACT_FORM_FOUND", 404);
    }

    return contactForm;
};

export default ShowContactFormService;
