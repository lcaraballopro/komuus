import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Typography,
    Divider,
} from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    fieldContainer: {
        marginBottom: theme.spacing(2),
    },
    formSelector: {
        marginBottom: theme.spacing(2),
    },
    noFormsMessage: {
        textAlign: "center",
        color: theme.palette.text.secondary,
        padding: theme.spacing(2),
    },
}));

const ContactFormFiller = ({ open, onClose, ticketId, contactId, formId: propFormId, onSuccess }) => {
    const classes = useStyles();

    const [forms, setForms] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState("");
    const [selectedForm, setSelectedForm] = useState(null);
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch available forms (only if not given a specific formId)
    useEffect(() => {
        const fetchForms = async () => {
            if (!open) return;

            // If a specific formId is provided, use it directly
            if (propFormId) {
                setSelectedFormId(propFormId);
                return;
            }

            setLoading(true);
            try {
                const { data } = await api.get("/contact-forms", {
                    params: { pageNumber: 1 },
                });
                // Filter only active forms
                const activeForms = data.contactForms.filter((f) => f.isActive);
                setForms(activeForms);
                if (activeForms.length === 1) {
                    setSelectedFormId(activeForms[0].id);
                }
            } catch (err) {
                toastError(err);
            }
            setLoading(false);
        };

        fetchForms();
    }, [open, propFormId]);

    // Fetch selected form details
    useEffect(() => {
        const fetchFormDetails = async () => {
            if (!selectedFormId) {
                setSelectedForm(null);
                setValues({});
                return;
            }

            try {
                const { data } = await api.get(`/contact-forms/${selectedFormId}`);
                setSelectedForm(data);
                // Initialize values
                const initialValues = {};
                data.fields.forEach((field) => {
                    initialValues[field.id] = field.type === "checkbox" ? false : "";
                });
                setValues(initialValues);
            } catch (err) {
                toastError(err);
            }
        };

        fetchFormDetails();
    }, [selectedFormId]);

    const handleClose = () => {
        setSelectedFormId("");
        setSelectedForm(null);
        setValues({});
        onClose();
    };

    const handleValueChange = (fieldId, value) => {
        setValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!selectedForm) return;

        // Validate required fields
        const requiredFields = selectedForm.fields.filter((f) => f.isRequired);
        for (const field of requiredFields) {
            const value = values[field.id];
            if (value === undefined || value === null || value === "") {
                toast.error(`El campo "${field.label}" es requerido`);
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = {
                ticketId,
                contactId,
                values: Object.entries(values).map(([fieldId, value]) => ({
                    fieldId: parseInt(fieldId),
                    value: typeof value === "boolean" ? (value ? "Sí" : "No") : String(value),
                })),
            };

            await api.post(`/contact-forms/${selectedFormId}/responses`, payload);
            toast.success(i18n.t("contactFormFiller.success"));

            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            } else {
                handleClose();
            }
        } catch (err) {
            toastError(err);
        }
        setSubmitting(false);
    };

    const renderField = (field) => {
        const value = values[field.id];

        switch (field.type) {
            case "text":
            case "email":
            case "phone":
            case "number":
                return (
                    <TextField
                        key={field.id}
                        label={field.label}
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={value || ""}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        variant="outlined"
                        fullWidth
                        size="small"
                        required={field.isRequired}
                        className={classes.fieldContainer}
                    />
                );

            case "textarea":
                return (
                    <TextField
                        key={field.id}
                        label={field.label}
                        placeholder={field.placeholder}
                        value={value || ""}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        required={field.isRequired}
                        className={classes.fieldContainer}
                    />
                );

            case "select":
                return (
                    <FormControl
                        key={field.id}
                        variant="outlined"
                        fullWidth
                        size="small"
                        className={classes.fieldContainer}
                        required={field.isRequired}
                    >
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                            value={value || ""}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            label={field.label}
                        >
                            <MenuItem value="">
                                <em>Seleccionar...</em>
                            </MenuItem>
                            {(field.options || []).map((option, idx) => (
                                <MenuItem key={idx} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case "checkbox":
                return (
                    <FormControlLabel
                        key={field.id}
                        control={
                            <Checkbox
                                checked={Boolean(value)}
                                onChange={(e) => handleValueChange(field.id, e.target.checked)}
                                color="primary"
                            />
                        }
                        label={field.label}
                        className={classes.fieldContainer}
                    />
                );

            case "date":
                return (
                    <TextField
                        key={field.id}
                        label={field.label}
                        type="date"
                        value={value || ""}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        variant="outlined"
                        fullWidth
                        size="small"
                        required={field.isRequired}
                        InputLabelProps={{ shrink: true }}
                        className={classes.fieldContainer}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{i18n.t("contactFormFiller.title")}</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <CircularProgress />
                    </div>
                ) : !propFormId && forms.length === 0 ? (
                    <Typography className={classes.noFormsMessage}>
                        {i18n.t("contactFormFiller.noForms")}
                    </Typography>
                ) : (
                    <>
                        {forms.length > 1 && (
                            <FormControl
                                variant="outlined"
                                fullWidth
                                size="small"
                                className={classes.formSelector}
                            >
                                <InputLabel>{i18n.t("contactFormFiller.selectForm")}</InputLabel>
                                <Select
                                    value={selectedFormId}
                                    onChange={(e) => setSelectedFormId(e.target.value)}
                                    label={i18n.t("contactFormFiller.selectForm")}
                                >
                                    {forms.map((form) => (
                                        <MenuItem key={form.id} value={form.id}>
                                            {form.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {selectedForm && (
                            <>
                                {selectedForm.description && (
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        style={{ marginBottom: 16 }}
                                    >
                                        {selectedForm.description}
                                    </Typography>
                                )}
                                <Divider style={{ marginBottom: 16 }} />
                                {selectedForm.fields
                                    .sort((a, b) => a.order - b.order)
                                    .map((field) => renderField(field))}
                            </>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" disabled={submitting}>
                    {i18n.t("contactFormFiller.buttons.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={submitting || !selectedForm}
                >
                    {submitting ? (
                        <CircularProgress size={24} />
                    ) : (
                        i18n.t("contactFormFiller.buttons.submit")
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContactFormFiller;
