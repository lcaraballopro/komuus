import React, { useState, useEffect, useReducer } from "react";
import openSocket from "../../services/socket-io";

import {
    Button,
    IconButton,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    TextField,
    MenuItem,
    Grid,
} from "@material-ui/core";
import { Edit, DeleteOutline } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ReservationModal from "../../components/ReservationModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const statusColors = {
    pending: "#ff9800",
    confirmed: "#2196f3",
    completed: "#4caf50",
    cancelled: "#f44336",
};

const reducer = (state, action) => {
    if (action.type === "LOAD_RESERVATIONS") {
        const reservations = action.payload;
        const newReservations = [];
        reservations.forEach((r) => {
            const idx = state.findIndex((s) => s.id === r.id);
            if (idx !== -1) {
                state[idx] = r;
            } else {
                newReservations.push(r);
            }
        });
        return [...state, ...newReservations];
    }
    if (action.type === "UPDATE_RESERVATION") {
        const reservation = action.payload;
        const idx = state.findIndex((s) => s.id === reservation.id);
        if (idx !== -1) {
            state[idx] = reservation;
            return [...state];
        }
        return [reservation, ...state];
    }
    if (action.type === "DELETE_RESERVATION") {
        const reservationId = action.payload;
        const idx = state.findIndex((s) => s.id === reservationId);
        if (idx !== -1) {
            state.splice(idx, 1);
        }
        return [...state];
    }
    if (action.type === "RESET") {
        return [];
    }
    return state;
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    filterBar: {
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1, 0),
    },
    colorDot: {
        width: 14,
        height: 14,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: 8,
        verticalAlign: "middle",
    },
}));

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const Reservations = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);
    const [reservations, dispatch] = useReducer(reducer, []);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [deletingReservation, setDeletingReservation] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;

            const { data } = await api.get("/reservations", { params });
            dispatch({ type: "RESET" });
            dispatch({ type: "LOAD_RESERVATIONS", payload: data });
            setLoading(false);
        } catch (err) {
            toastError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [statusFilter]);

    useEffect(() => {
        const socket = openSocket();

        socket.on("reservation", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_RESERVATION", payload: data.reservation });
            }
            if (data.action === "delete") {
                dispatch({
                    type: "DELETE_RESERVATION",
                    payload: +data.reservationId,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenModal = () => {
        setSelectedReservation(null);
        setReservationModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedReservation(null);
        setReservationModalOpen(false);
        fetchReservations();
    };

    const handleEdit = (reservation) => {
        setSelectedReservation(reservation);
        setReservationModalOpen(true);
    };

    const handleDelete = async (reservationId) => {
        try {
            await api.delete(`/reservations/${reservationId}`);
            toast.success(i18n.t("reservations.toasts.deleted"));
            fetchReservations();
        } catch (err) {
            toastError(err);
        }
        setDeletingReservation(null);
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={
                    deletingReservation &&
                    `${i18n.t("reservations.confirmationModal.deleteTitle")} ${deletingReservation.title}?`
                }
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDelete(deletingReservation.id)}
            >
                {i18n.t("reservations.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <ReservationModal
                open={reservationModalOpen}
                onClose={handleCloseModal}
                reservationId={selectedReservation && selectedReservation.id}
            />
            <MainHeader>
                <Title>{i18n.t("reservations.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenModal}
                    >
                        {i18n.t("reservations.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>

            <div className={classes.filterBar}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            select
                            label={i18n.t("reservations.filters.status")}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">{i18n.t("reservations.filters.all")}</MenuItem>
                            <MenuItem value="pending">{i18n.t("reservations.statuses.pending")}</MenuItem>
                            <MenuItem value="confirmed">{i18n.t("reservations.statuses.confirmed")}</MenuItem>
                            <MenuItem value="completed">{i18n.t("reservations.statuses.completed")}</MenuItem>
                            <MenuItem value="cancelled">{i18n.t("reservations.statuses.cancelled")}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </div>

            <Paper className={classes.mainPaper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                {i18n.t("reservations.table.title")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("reservations.table.contact")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("reservations.table.agent")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("reservations.table.date")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("reservations.table.status")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("reservations.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {reservations.map((reservation) => (
                                <TableRow key={reservation.id}>
                                    <TableCell align="left">
                                        <span
                                            className={classes.colorDot}
                                            style={{ backgroundColor: reservation.color }}
                                        />
                                        <strong>{reservation.title}</strong>
                                        {reservation.description && (
                                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                                                {reservation.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {reservation.contact?.name || "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {reservation.user?.name || "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <div>{formatDate(reservation.startDate)}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#999" }}>
                                            → {formatDate(reservation.endDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            label={i18n.t(`reservations.statuses.${reservation.status}`)}
                                            style={{
                                                backgroundColor: statusColors[reservation.status] || "#9e9e9e",
                                                color: "#fff",
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(reservation)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setConfirmModalOpen(true);
                                                setDeletingReservation(reservation);
                                            }}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={6} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Reservations;
