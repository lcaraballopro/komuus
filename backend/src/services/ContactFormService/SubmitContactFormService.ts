import ContactForm from "../../models/ContactForm";
import ContactFormField from "../../models/ContactFormField";
import ContactFormResponse from "../../models/ContactFormResponse";
import ContactFormResponseValue from "../../models/ContactFormResponseValue";
import AppError from "../../errors/AppError";

interface FieldValue {
    fieldId: number;
    value: string;
}

interface Request {
    formId: string | number;
    ticketId?: number;
    contactId?: number;
    submittedBy: number;
    values: FieldValue[];
    tenantId: number;
}

const SubmitContactFormService = async ({
    formId,
    ticketId,
    contactId,
    submittedBy,
    values,
    tenantId
}: Request): Promise<ContactFormResponse> => {
    // Verify form exists and belongs to tenant
    const contactForm = await ContactForm.findOne({
        where: { id: formId, tenantId, isActive: true },
        include: [
            {
                model: ContactFormField,
                as: "fields"
            }
        ]
    });

    if (!contactForm) {
        throw new AppError("ERR_NO_CONTACT_FORM_FOUND", 404);
    }

    // Validate required fields
    const requiredFields = contactForm.fields.filter(f => f.isRequired);
    for (const field of requiredFields) {
        const submittedValue = values.find(v => v.fieldId === field.id);
        if (!submittedValue || !submittedValue.value || submittedValue.value.trim() === "") {
            throw new AppError(`ERR_FIELD_REQUIRED:${field.label}`, 400);
        }
    }

    // Create response
    const response = await ContactFormResponse.create({
        formId: Number(formId),
        ticketId,
        contactId,
        submittedBy,
        tenantId
    });

    // Create response values
    const responseValues = values.map(v => ({
        responseId: response.id,
        fieldId: v.fieldId,
        value: v.value,
        tenantId
    }));

    await ContactFormResponseValue.bulkCreate(responseValues);

    // Reload with associations
    await response.reload({
        include: [
            {
                model: ContactFormResponseValue,
                as: "values",
                include: [
                    {
                        model: ContactFormField,
                        as: "field"
                    }
                ]
            },
            {
                model: ContactForm,
                as: "form"
            }
        ]
    });

    return response;
};

export default SubmitContactFormService;
