import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListContactFormsService from "../services/ContactFormService/ListContactFormsService";
import CreateContactFormService from "../services/ContactFormService/CreateContactFormService";
import ShowContactFormService from "../services/ContactFormService/ShowContactFormService";
import UpdateContactFormService from "../services/ContactFormService/UpdateContactFormService";
import DeleteContactFormService from "../services/ContactFormService/DeleteContactFormService";
import SubmitContactFormService from "../services/ContactFormService/SubmitContactFormService";
import ListContactFormResponsesService from "../services/ContactFormService/ListContactFormResponsesService";

interface IndexQuery {
    searchParam?: string;
    pageNumber?: string;
    whatsappId?: string;
}

interface ResponsesQuery {
    ticketId?: string;
    contactId?: string;
    pageNumber?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { searchParam, pageNumber, whatsappId } = req.query as IndexQuery;

    const { contactForms, count, hasMore } = await ListContactFormsService({
        searchParam,
        pageNumber,
        tenantId,
        whatsappId: whatsappId ? Number(whatsappId) : undefined
    });

    return res.json({ contactForms, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { name, description, isActive, fields, whatsappId } = req.body;

    const contactForm = await CreateContactFormService({
        name,
        description,
        isActive,
        fields,
        tenantId,
        whatsappId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("contactForm", {
        action: "create",
        contactForm
    });

    return res.status(201).json(contactForm);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { formId } = req.params;

    const contactForm = await ShowContactFormService({
        id: formId,
        tenantId
    });

    return res.json(contactForm);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { formId } = req.params;
    const formData = req.body;

    const contactForm = await UpdateContactFormService({
        formId,
        formData,
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("contactForm", {
        action: "update",
        contactForm
    });

    return res.status(200).json(contactForm);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { formId } = req.params;

    await DeleteContactFormService({
        id: formId,
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("contactForm", {
        action: "delete",
        formId
    });

    return res.status(200).json({ message: "Contact form deleted" });
};

export const submitResponse = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId, id: userId } = req.user;
    const { formId } = req.params;
    const { ticketId, contactId, values } = req.body;

    const response = await SubmitContactFormService({
        formId,
        ticketId,
        contactId,
        submittedBy: Number(userId),
        values,
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("contactFormResponse", {
        action: "create",
        response
    });

    return res.status(201).json(response);
};

export const listResponses = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { formId } = req.params;
    const { ticketId, contactId, pageNumber } = req.query as ResponsesQuery;

    const { responses, count, hasMore } = await ListContactFormResponsesService({
        formId,
        ticketId,
        contactId,
        pageNumber,
        tenantId
    });

    return res.json({ responses, count, hasMore });
};
