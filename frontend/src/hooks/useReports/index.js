import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useReports = (filters = {}) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        tickets: { total: 0, open: 0, pending: 0, closed: 0, bot: 0 },
        agents: [],
        queues: [],
        daily: [],
        contacts: { total: 0, newThisPeriod: 0 },
        typifications: []
    });

    // Detailed tickets state
    const [detailedTickets, setDetailedTickets] = useState({
        tickets: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [detailedLoading, setDetailedLoading] = useState(false);

    // Form responses state
    const [formResponses, setFormResponses] = useState({
        responses: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        allFieldLabels: []
    });
    const [formResponsesLoading, setFormResponsesLoading] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });

            const { data: reportData } = await api.get(`/reports/dashboard?${params.toString()}`);
            setData(reportData);
        } catch (err) {
            toastError(err);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    const fetchDetailedTickets = useCallback(async (page = 1, limit = 10) => {
        setDetailedLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
            params.append("page", String(page));
            params.append("limit", String(limit));

            const { data: detailedData } = await api.get(`/reports/tickets/detailed?${params.toString()}`);
            setDetailedTickets(detailedData);
        } catch (err) {
            toastError(err);
        } finally {
            setDetailedLoading(false);
        }
    }, [JSON.stringify(filters)]);

    const fetchFormResponses = useCallback(async (page = 1, limit = 10) => {
        setFormResponsesLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
            params.append("page", String(page));
            params.append("limit", String(limit));

            const { data: formData } = await api.get(`/reports/form-responses?${params.toString()}`);
            setFormResponses(formData);
        } catch (err) {
            toastError(err);
        } finally {
            setFormResponsesLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const refresh = () => {
        fetchReports();
        fetchDetailedTickets(detailedTickets.page, detailedTickets.limit);
        fetchFormResponses(formResponses.page, formResponses.limit);
    };

    return {
        data,
        loading,
        refresh,
        detailedTickets,
        detailedLoading,
        fetchDetailedTickets,
        formResponses,
        formResponsesLoading,
        fetchFormResponses
    };
};

export default useReports;
