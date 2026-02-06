import ContactForm from "../../models/ContactForm";
import ContactFormField from "../../models/ContactFormField";
import ContactFormResponse from "../../models/ContactFormResponse";
import ContactFormResponseValue from "../../models/ContactFormResponseValue";
import AppError from "../../errors/AppError";

interface Request {
    id: string | number;
    tenantId: number;
}

const DeleteContactFormService = async ({
    id,
    tenantId
}: Request): Promise<void> => {
    const contactForm = await ContactForm.findOne({
        where: { id, tenantId }
    });

    if (!contactForm) {
        throw new AppError("ERR_NO_CONTACT_FORM_FOUND", 404);
    }

    // Delete all response values first (cascade)
    const responses = await ContactFormResponse.findAll({
        where: { formId: id, tenantId }
    });

    const responseIds = responses.map(r => r.id);
    if (responseIds.length > 0) {
        await ContactFormResponseValue.destroy({
            where: { responseId: responseIds, tenantId }
        });
    }

    // Delete responses
    await ContactFormResponse.destroy({
        where: { formId: id, tenantId }
    });

    // Delete fields
    await ContactFormField.destroy({
        where: { formId: id, tenantId }
    });

    // Delete form
    await contactForm.destroy();
};

export default DeleteContactFormService;
