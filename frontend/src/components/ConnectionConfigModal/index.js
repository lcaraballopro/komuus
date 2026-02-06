import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
    Box,
    Button,
    IconButton,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    CircularProgress,
    makeStyles,
} from "@material-ui/core";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
} from "@material-ui/icons";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import CloseReasonModal from "../CloseReasonModal";
import ConfirmationModal from "../ConfirmationModal";
import ContactFormModal from "../ContactFormModal";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        minHeight: 400,
        padding: 0,
    },
    tabPanel: {
        padding: theme.spacing(2),
    },
    tableContainer: {
        marginTop: theme.spacing(2),
    },
    addButton: {
        marginBottom: theme.spacing(2),
    },
    emptyState: {
        textAlign: "center",
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    closeButton: {
        marginLeft: theme.spacing(2),
    },
}));

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} className="tabPanel">
        {value === index && <Box p={2}>{children}</Box>}
    </div>
);

const ConnectionConfigModal = ({ open, onClose, whatsapp }) => {
    const classes = useStyles();
    const [tabValue, setTabValue] = useState(0);
    const [closeReasons, setCloseReasons] = useState([]);
    const [contactForms, setContactForms] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [closeReasonModalOpen, setCloseReasonModalOpen] = useState(false);
    const [contactFormModalOpen, setContactFormModalOpen] = useState(false);
    const [selectedCloseReasonId, setSelectedCloseReasonId] = useState(null);
    const [selectedContactFormId, setSelectedContactFormId] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null });

    useEffect(() => {
        if (open && whatsapp?.id) {
            fetchCloseReasons();
            fetchContactForms();
        }
    }, [open, whatsapp?.id]);

    const fetchCloseReasons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/close-reasons", {
                params: { whatsappId: whatsapp.id }
            });
            setCloseReasons(data);
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    };

    const fetchContactForms = async () => {
        try {
            const { data } = await api.get("/contact-forms", {
                params: { whatsappId: whatsapp.id }
            });
            setContactForms(data.contactForms || []);
        } catch (err) {
            toastError(err);
        }
    };

    const handleEditCloseReason = (id) => {
        setSelectedCloseReasonId(id);
        setCloseReasonModalOpen(true);
    };

    const handleNewCloseReason = () => {
        setSelectedCloseReasonId(null);
        setCloseReasonModalOpen(true);
    };

    const handleCloseReasonModalClose = () => {
        setCloseReasonModalOpen(false);
        setSelectedCloseReasonId(null);
        fetchCloseReasons();
    };

    const handleEditContactForm = (id) => {
        setSelectedContactFormId(id);
        setContactFormModalOpen(true);
    };

    const handleNewContactForm = () => {
        setSelectedContactFormId(null);
        setContactFormModalOpen(true);
    };

    const handleContactFormModalClose = () => {
        setContactFormModalOpen(false);
        setSelectedContactFormId(null);
        fetchContactForms();
    };

    const handleDeleteClick = (type, id) => {
        setDeleteTarget({ type, id });
        setConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (deleteTarget.type === "closeReason") {
                await api.delete(`/close-reasons/${deleteTarget.id}`);
                fetchCloseReasons();
            } else if (deleteTarget.type === "contactForm") {
                await api.delete(`/contact-forms/${deleteTarget.id}`);
                fetchContactForms();
            }
        } catch (err) {
            toastError(err);
        }
        setConfirmModalOpen(false);
        setDeleteTarget({ type: null, id: null });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <div className={classes.header}>
                    <Typography variant="h6">
                        {i18n.t("connectionConfig.title")}: {whatsapp?.name}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </div>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label={i18n.t("connectionConfig.tabs.closeReasons")} />
                    <Tab label={i18n.t("connectionConfig.tabs.contactForms")} />
                </Tabs>
                <DialogContent className={classes.dialogContent}>
                    {/* Close Reasons Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleNewCloseReason}
                            className={classes.addButton}
                        >
                            {i18n.t("connectionConfig.buttons.addCloseReason")}
                        </Button>

                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : closeReasons.length === 0 ? (
                            <Typography className={classes.emptyState}>
                                {i18n.t("connectionConfig.noCloseReasons")}
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{i18n.t("closeReasons.table.name")}</TableCell>
                                        <TableCell>{i18n.t("closeReasons.table.category")}</TableCell>
                                        <TableCell>{i18n.t("closeReasons.table.form")}</TableCell>
                                        <TableCell align="center">{i18n.t("closeReasons.table.actions")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {closeReasons.map((reason) => (
                                        <TableRow key={reason.id}>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={reason.name}
                                                    style={{ backgroundColor: reason.color, color: "#fff" }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {reason.category === "positive" ? "🟢 Positivo" : "🔴 Negativo"}
                                            </TableCell>
                                            <TableCell>
                                                {reason.form?.name || "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={() => handleEditCloseReason(reason.id)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteClick("closeReason", reason.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TabPanel>

                    {/* Contact Forms Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleNewContactForm}
                            className={classes.addButton}
                        >
                            {i18n.t("connectionConfig.buttons.addContactForm")}
                        </Button>

                        {contactForms.length === 0 ? (
                            <Typography className={classes.emptyState}>
                                {i18n.t("connectionConfig.noContactForms")}
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{i18n.t("contactForms.table.name")}</TableCell>
                                        <TableCell>{i18n.t("contactForms.table.fields")}</TableCell>
                                        <TableCell>{i18n.t("contactForms.table.status")}</TableCell>
                                        <TableCell align="center">{i18n.t("contactForms.table.actions")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {contactForms.map((form) => (
                                        <TableRow key={form.id}>
                                            <TableCell>{form.name}</TableCell>
                                            <TableCell>{form.fields?.length || 0}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={form.isActive ? "Activo" : "Inactivo"}
                                                    color={form.isActive ? "primary" : "default"}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={() => handleEditContactForm(form.id)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteClick("contactForm", form.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TabPanel>
                </DialogContent>
            </Dialog>

            {/* CloseReason Modal */}
            <CloseReasonModal
                open={closeReasonModalOpen}
                onClose={handleCloseReasonModalClose}
                closeReasonId={selectedCloseReasonId}
                whatsappId={whatsapp?.id}
            />

            {/* ContactForm Modal */}
            {contactFormModalOpen && (
                <ContactFormModal
                    open={contactFormModalOpen}
                    onClose={handleContactFormModalClose}
                    formId={selectedContactFormId}
                    whatsappId={whatsapp?.id}
                />
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                title={i18n.t("connectionConfig.confirmDelete.title")}
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
            >
                {i18n.t("connectionConfig.confirmDelete.message")}
            </ConfirmationModal>
        </>
    );
};

export default ConnectionConfigModal;
