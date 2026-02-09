import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateReservationService from "../services/ReservationService/CreateReservationService";
import ListReservationsService from "../services/ReservationService/ListReservationsService";
import ShowReservationService from "../services/ReservationService/ShowReservationService";
import UpdateReservationService from "../services/ReservationService/UpdateReservationService";
import DeleteReservationService from "../services/ReservationService/DeleteReservationService";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { status, contactId, userId, startDate, endDate } = req.query;

    const reservations = await ListReservationsService({
        tenantId,
        status: status as string,
        contactId: contactId ? Number(contactId) : undefined,
        userId: userId ? Number(userId) : undefined,
        startDate: startDate as string,
        endDate: endDate as string
    });

    return res.json(reservations);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { title, description, startDate, endDate, status, notes, color, contactId, userId, ticketId } = req.body;

    const reservation = await CreateReservationService({
        title,
        description,
        startDate,
        endDate,
        status,
        notes,
        color,
        contactId,
        userId,
        ticketId,
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("reservation", {
        action: "create",
        reservation
    });

    return res.status(201).json(reservation);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { reservationId } = req.params;
    const { tenantId } = req.user;

    const reservation = await ShowReservationService({
        reservationId: Number(reservationId),
        tenantId
    });

    return res.json(reservation);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { reservationId } = req.params;
    const { tenantId } = req.user;
    const { title, description, startDate, endDate, status, notes, color, contactId, userId, ticketId } = req.body;

    const reservation = await UpdateReservationService({
        reservationId: Number(reservationId),
        tenantId,
        title,
        description,
        startDate,
        endDate,
        status,
        notes,
        color,
        contactId,
        userId,
        ticketId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("reservation", {
        action: "update",
        reservation
    });

    return res.json(reservation);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const { reservationId } = req.params;
    const { tenantId } = req.user;

    await DeleteReservationService({
        reservationId: Number(reservationId),
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("reservation", {
        action: "delete",
        reservationId: Number(reservationId)
    });

    return res.status(200).json({ message: "Reservation deleted" });
};
