import { Request, Response } from "express";
import * as Yup from "yup";
import TelephonyChannel from "../models/TelephonyChannel";
import Queue from "../models/Queue";
import ProcessIncomingCallService from "../services/TelephonyServices/ProcessIncomingCallService";
import ProcessCallHangupService from "../services/TelephonyServices/ProcessCallHangupService";

interface TelephonyData {
    name: string;
    trunkUsername: string;
    trunkPassword: string;
    trunkDomain: string;
    trunkPort: number;
    context: string;
    queueId: number;
    isActive: boolean;
    tenantId: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;

    const channels = await TelephonyChannel.findAll({
        where: { tenantId },
        include: [{ model: Queue }]
    });

    return res.json(channels);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const newData = { ...req.body, tenantId };

    const schema = Yup.object().shape({
        name: Yup.string().required(),
        trunkUsername: Yup.string().required(),
        trunkPassword: Yup.string().required(),
        trunkDomain: Yup.string().required()
    });

    try {
        await schema.validate(newData);
    } catch (err: any) {
        throw new Error(err.message);
    }

    const channel = await TelephonyChannel.create(newData);

    return res.status(200).json(channel);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { tenantId } = req.user;

    const channel = await TelephonyChannel.findOne({
        where: { id, tenantId },
        include: [{ model: Queue }]
    });

    if (!channel) {
        throw new Error("ERR_NO_CHANNEL_FOUND");
    }

    return res.json(channel);
};

export const update = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { id } = req.params;
    const { tenantId } = req.user;

    const channel = await TelephonyChannel.findOne({
        where: { id, tenantId }
    });

    if (!channel) {
        throw new Error("ERR_NO_CHANNEL_FOUND");
    }

    await channel.update(req.body);

    return res.json(channel);
};

export const remove = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { id } = req.params;
    const { tenantId } = req.user;

    const channel = await TelephonyChannel.findOne({
        where: { id, tenantId }
    });

    if (!channel) {
        throw new Error("ERR_NO_CHANNEL_FOUND");
    }

    await channel.destroy();

    return res.status(200).json({ message: "Channel deleted" });
};

export const handleIncomingCall = async (
    req: Request,
    res: Response
): Promise<Response> => {
    // Basic webhook implementation
    // Expected payload: { trunkUsername, from, to, status, duration, recordingUrl }
    const { trunkUsername, from, to, status, duration, recordingUrl } = req.body;

    try {
        let result;
        if (status === "hangup" || status === "completed") {
            result = await ProcessCallHangupService({ trunkUsername, from, to, duration, recordingUrl });
        } else {
            result = await ProcessIncomingCallService({ trunkUsername, from, to, status });
        }

        return res.status(200).json(result);
    } catch (err: any) {
        if (err.message === "ERR_NO_CHANNEL_FOUND") {
            return res.status(404).json({ error: "Channel not found" });
        }
        return res.status(500).json({ error: err.message });
    }
};
