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
} from "@material-ui/core";
import { Edit, DeleteOutline } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CloseReasonModal from "../../components/CloseReasonModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
    if (action.type === "LOAD_CLOSE_REASONS") {
        const closeReasons = action.payload;
        const newCloseReasons = [];

        closeReasons.forEach((closeReason) => {
            const closeReasonIndex = state.findIndex((c) => c.id === closeReason.id);
            if (closeReasonIndex !== -1) {
                state[closeReasonIndex] = closeReason;
            } else {
                newCloseReasons.push(closeReason);
            }
        });

        return [...state, ...newCloseReasons];
    }

    if (action.type === "UPDATE_CLOSE_REASON") {
        const closeReason = action.payload;
        const closeReasonIndex = state.findIndex((c) => c.id === closeReason.id);

        if (closeReasonIndex !== -1) {
            state[closeReasonIndex] = closeReason;
            return [...state];
        } else {
            return [closeReason, ...state];
        }
    }

    if (action.type === "DELETE_CLOSE_REASON") {
        const closeReasonId = action.payload;
        const closeReasonIndex = state.findIndex((c) => c.id === closeReasonId);
        if (closeReasonIndex !== -1) {
            state.splice(closeReasonIndex, 1);
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
    positiveChip: {
        backgroundColor: "#4caf50",
        color: "#fff",
    },
    negativeChip: {
        backgroundColor: "#f44336",
        color: "#fff",
    },
    activeChip: {
        backgroundColor: theme.palette.success?.main || "#4caf50",
        color: "#fff",
    },
    inactiveChip: {
        backgroundColor: theme.palette.grey[500],
        color: "#fff",
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: 8,
        verticalAlign: "middle",
    },
}));

const CloseReasons = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);
    const [closeReasons, dispatch] = useReducer(reducer, []);
    const [selectedCloseReason, setSelectedCloseReason] = useState(null);
    const [closeReasonModalOpen, setCloseReasonModalOpen] = useState(false);
    const [deletingCloseReason, setDeletingCloseReason] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const fetchCloseReasons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/close-reasons");
            dispatch({ type: "RESET" });
            dispatch({ type: "LOAD_CLOSE_REASONS", payload: data });
            setLoading(false);
        } catch (err) {
            toastError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCloseReasons();
    }, []);

    useEffect(() => {
        const socket = openSocket();

        socket.on("closeReason", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_CLOSE_REASON", payload: data.closeReason });
            }

            if (data.action === "delete") {
                dispatch({
                    type: "DELETE_CLOSE_REASON",
                    payload: +data.closeReasonId,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenCloseReasonModal = () => {
        setSelectedCloseReason(null);
        setCloseReasonModalOpen(true);
    };

    const handleCloseCloseReasonModal = () => {
        setSelectedCloseReason(null);
        setCloseReasonModalOpen(false);
    };

    const handleEditCloseReason = (closeReason) => {
        setSelectedCloseReason(closeReason);
        setCloseReasonModalOpen(true);
    };

    const handleDeleteCloseReason = async (closeReasonId) => {
        try {
            await api.delete(`/close-reasons/${closeReasonId}`);
            toast.success(i18n.t("closeReasons.toasts.deleted"));
            fetchCloseReasons();
        } catch (err) {
            toastError(err);
        }
        setDeletingCloseReason(null);
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={
                    deletingCloseReason &&
                    `${i18n.t("closeReasons.confirmationModal.deleteTitle")} ${deletingCloseReason.name}?`
                }
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteCloseReason(deletingCloseReason.id)}
            >
                {i18n.t("closeReasons.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <CloseReasonModal
                open={closeReasonModalOpen}
                onClose={handleCloseCloseReasonModal}
                closeReasonId={selectedCloseReason && selectedCloseReason.id}
            />
            <MainHeader>
                <Title>{i18n.t("closeReasons.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenCloseReasonModal}
                    >
                        {i18n.t("closeReasons.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                {i18n.t("closeReasons.table.name")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("closeReasons.table.category")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("closeReasons.table.form")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("closeReasons.table.status")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("closeReasons.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {closeReasons.map((closeReason) => (
                                <TableRow key={closeReason.id}>
                                    <TableCell align="left">
                                        <span
                                            className={classes.colorDot}
                                            style={{ backgroundColor: closeReason.color }}
                                        />
                                        <strong>{closeReason.name}</strong>
                                        {closeReason.description && (
                                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                                                {closeReason.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            label={closeReason.category === "positive"
                                                ? i18n.t("closeReasons.categories.positive")
                                                : i18n.t("closeReasons.categories.negative")}
                                            className={closeReason.category === "positive"
                                                ? classes.positiveChip
                                                : classes.negativeChip}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {closeReason.form?.name || "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            label={closeReason.isActive
                                                ? i18n.t("closeReasons.status.active")
                                                : i18n.t("closeReasons.status.inactive")}
                                            className={closeReason.isActive
                                                ? classes.activeChip
                                                : classes.inactiveChip}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditCloseReason(closeReason)}
                                        >
                                            <Edit />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setConfirmModalOpen(true);
                                                setDeletingCloseReason(closeReason);
                                            }}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={5} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default CloseReasons;
