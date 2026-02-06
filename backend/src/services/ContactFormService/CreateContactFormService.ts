import ContactForm from "../../models/ContactForm";
import ContactFormField from "../../models/ContactFormField";
import AppError from "../../errors/AppError";

interface FieldData {
    type: string;
    label: string;
    placeholder?: string;
    options?: string[];
    isRequired?: boolean;
    order?: number;
}

interface Request {
    name: string;
    description?: string;
    isActive?: boolean;
    fields?: FieldData[];
    tenantId: number;
}

const CreateContactFormService = async ({
    name,
    description,
    isActive = true,
    fields = [],
    tenantId
}: Request): Promise<ContactForm> => {
    // Validate unique name per tenant
    const existingForm = await ContactForm.findOne({
        where: { name, tenantId }
    });

    if (existingForm) {
        throw new AppError("ERR_CONTACT_FORM_NAME_ALREADY_EXISTS");
    }

    // Create the form
    const contactForm = await ContactForm.create({
        name,
        description,
        isActive,
        tenantId
    });

    // Create fields if provided
    if (fields.length > 0) {
        const fieldsWithForm = fields.map((field, index) => ({
            ...field,
            formId: contactForm.id,
            tenantId,
            order: field.order !== undefined ? field.order : index
        }));

        await ContactFormField.bulkCreate(fieldsWithForm);
    }

    // Reload with associations
    await contactForm.reload({
        include: [
            {
                model: ContactFormField,
                as: "fields",
                separate: true,
                order: [["order", "ASC"]]
            }
        ]
    });

    return contactForm;
};

export default CreateContactFormService;
