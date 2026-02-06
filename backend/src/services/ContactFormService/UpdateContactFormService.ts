import ContactForm from "../../models/ContactForm";
import ContactFormField from "../../models/ContactFormField";
import AppError from "../../errors/AppError";

interface FieldData {
    id?: number;
    type: string;
    label: string;
    placeholder?: string;
    options?: string[];
    isRequired?: boolean;
    order?: number;
}

interface Request {
    formId: string | number;
    formData: {
        name?: string;
        description?: string;
        isActive?: boolean;
        fields?: FieldData[];
    };
    tenantId: number;
}

const UpdateContactFormService = async ({
    formId,
    formData,
    tenantId
}: Request): Promise<ContactForm> => {
    const { name, description, isActive, fields } = formData;

    const contactForm = await ContactForm.findOne({
        where: { id: formId, tenantId }
    });

    if (!contactForm) {
        throw new AppError("ERR_NO_CONTACT_FORM_FOUND", 404);
    }

    // Check unique name if changing
    if (name && name !== contactForm.name) {
        const existingForm = await ContactForm.findOne({
            where: { name, tenantId }
        });

        if (existingForm) {
            throw new AppError("ERR_CONTACT_FORM_NAME_ALREADY_EXISTS");
        }
    }

    // Update form properties
    await contactForm.update({
        name: name || contactForm.name,
        description: description !== undefined ? description : contactForm.description,
        isActive: isActive !== undefined ? isActive : contactForm.isActive
    });

    // Update fields if provided
    if (fields !== undefined) {
        // Get existing field IDs to determine what to delete
        const existingFields = await ContactFormField.findAll({
            where: { formId: contactForm.id, tenantId }
        });
        const existingFieldIds = existingFields.map(f => f.id);
        const providedFieldIds = fields.filter(f => f.id).map(f => f.id);

        // Delete fields that are no longer in the list
        const fieldsToDelete = existingFieldIds.filter(id => !providedFieldIds.includes(id));
        if (fieldsToDelete.length > 0) {
            await ContactFormField.destroy({
                where: { id: fieldsToDelete, tenantId }
            });
        }

        // Update or create fields
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const fieldData = {
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                options: field.options,
                isRequired: field.isRequired || false,
                order: field.order !== undefined ? field.order : i
            };

            if (field.id) {
                // Update existing field
                await ContactFormField.update(fieldData, {
                    where: { id: field.id, formId: contactForm.id, tenantId }
                });
            } else {
                // Create new field
                await ContactFormField.create({
                    ...fieldData,
                    formId: contactForm.id,
                    tenantId
                });
            }
        }
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

export default UpdateContactFormService;
