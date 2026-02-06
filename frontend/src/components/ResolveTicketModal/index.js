import React, { useState, useEffect, useContext } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    makeStyles,
    Typography,
    Chip,
    Divider,
    Box,
} from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ContactFormFiller from "../ContactFormFiller";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        minHeight: 200,
    },
    reasonsContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
    reasonChip: {
        cursor: "pointer",
        fontSize: "0.9rem",
        padding: theme.spacing(1),
        "&:hover": {
            opacity: 0.8,
        },
    },
    selectedChip: {
        border: `2px solid ${theme.palette.primary.main}`,
        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
    sectionTitle: {
        marginBottom: theme.spacing(1),
        fontWeight: 600,
        color: theme.palette.text.secondary,
    },
    formSection: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: theme.palette.type === "dark" ? "#424242" : "#f5f5f5",
        borderRadius: 8,
    },
    noReasons: {
        textAlign: "center",
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    },
}));

const ResolveTicketModal = ({ open, onClose, ticket, onResolve }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [closeReasons, setCloseReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState(null);
    const [formCompleted, setFormCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formFillerOpen, setFormFillerOpen] = useState(false);

    // Group reasons by category
    const positiveReasons = closeReasons.filter(r => r.category === "positive");
    const negativeReasons = closeReasons.filter(r => r.category === "negative");

    useEffect(() => {
        if (open) {
            setSelectedReason(null);
            setFormCompleted(false);
            fetchCloseReasons();
        }
    }, [open]);

    const fetchCloseReasons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/close-reasons", {
                params: { activeOnly: "true" }
            });
            setCloseReasons(data);
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    };

    const handleSelectReason = (reason) => {
        setSelectedReason(reason);
        setFormCompleted(false);

        // If reason has associated form, open the form filler
        if (reason.formId) {
            setFormFillerOpen(true);
        } else {
            setFormCompleted(true);
        }
    };

    const handleFormSubmit = () => {
        setFormFillerOpen(false);
        setFormCompleted(true);
    };

    const handleFormClose = () => {
        setFormFillerOpen(false);
        // If form was required but not completed, deselect reason
        if (selectedReason?.formId && !formCompleted) {
            setSelectedReason(null);
        }
    };

    const handleConfirmResolve = async () => {
        if (!selectedReason) return;

        setSubmitting(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "closed",
                userId: user?.id,
                closeReasonId: selectedReason.id,
                closedBy: user?.id,
            });

            if (onResolve) {
                onResolve();
            }
            onClose();
        } catch (err) {
            toastError(err);
        }
        setSubmitting(false);
    };

    const canConfirm = selectedReason && (formCompleted || !selectedReason.formId);

    const renderReasonChip = (reason) => (
        <Chip
            key={reason.id}
            label={reason.name}
            className={`${classes.reasonChip} ${selectedReason?.id === reason.id ? classes.selectedChip : ""}`}
            style={{
                backgroundColor: reason.color,
                color: "#fff"
            }}
            onClick={() => handleSelectReason(reason)}
        />
    );

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {i18n.t("resolveTicketModal.title")}
                </DialogTitle>
                <DialogContent className={classes.dialogContent} dividers>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : closeReasons.length === 0 ? (
                        <Typography className={classes.noReasons}>
                            {i18n.t("resolveTicketModal.noReasons")}
                        </Typography>
                    ) : (
                        <>
                            {positiveReasons.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" className={classes.sectionTitle}>
                                        🟢 {i18n.t("closeReasons.categories.positive")}
                                    </Typography>
                                    <div className={classes.reasonsContainer}>
                                        {positiveReasons.map(renderReasonChip)}
                                    </div>
                                </>
                            )}

                            {negativeReasons.length > 0 && (
                                <>
                                    {positiveReasons.length > 0 && <Divider style={{ margin: "16px 0" }} />}
                                    <Typography variant="subtitle2" className={classes.sectionTitle}>
                                        🔴 {i18n.t("closeReasons.categories.negative")}
                                    </Typography>
                                    <div className={classes.reasonsContainer}>
                                        {negativeReasons.map(renderReasonChip)}
                                    </div>
                                </>
                            )}

                            {selectedReason && selectedReason.formId && (
                                <div className={classes.formSection}>
                                    <Typography variant="body2" color="textSecondary">
                                        {formCompleted
                                            ? `✅ ${i18n.t("resolveTicketModal.formCompleted")}`
                                            : `📋 ${i18n.t("resolveTicketModal.formRequired")}`}
                                    </Typography>
                                    {!formCompleted && (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => setFormFillerOpen(true)}
                                            style={{ marginTop: 8 }}
                                        >
                                            {i18n.t("resolveTicketModal.fillForm")}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary" disabled={submitting}>
                        {i18n.t("resolveTicketModal.cancel")}
                    </Button>
                    <Button
                        onClick={handleConfirmResolve}
                        color="primary"
                        variant="contained"
                        disabled={!canConfirm || submitting}
                    >
                        {submitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            i18n.t("resolveTicketModal.confirm")
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {selectedReason?.formId && (
                <ContactFormFiller
                    open={formFillerOpen}
                    onClose={handleFormClose}
                    ticketId={ticket?.id}
                    contactId={ticket?.contact?.id}
                    formId={selectedReason.formId}
                    onSuccess={handleFormSubmit}
                />
            )}
        </>
    );
};

export default ResolveTicketModal;
