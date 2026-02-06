import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    makeStyles,
} from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    form: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
    },
    colorInput: {
        marginTop: theme.spacing(1),
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 4,
        display: "inline-block",
        marginRight: theme.spacing(1),
        verticalAlign: "middle",
    },
}));

const CloseReasonSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Muy corto!")
        .max(100, "Muy largo!")
        .required("Requerido"),
    category: Yup.string().required("Requerido"),
});

const CloseReasonModal = ({ open, onClose, closeReasonId }) => {
    const classes = useStyles();
    const [forms, setForms] = useState([]);
    const [loadingForms, setLoadingForms] = useState(false);

    const initialState = {
        name: "",
        description: "",
        category: "positive",
        color: "#4caf50",
        order: 0,
        formId: "",
        isActive: true,
    };

    const [closeReason, setCloseReason] = useState(initialState);

    useEffect(() => {
        if (open) {
            const fetchForms = async () => {
                setLoadingForms(true);
                try {
                    const { data } = await api.get("/contact-forms");
                    setForms(data.contactForms || data || []);
                } catch (err) {
                    console.error("Error fetching forms:", err);
                }
                setLoadingForms(false);
            };
            fetchForms();
        }
    }, [open]);

    useEffect(() => {
        if (!closeReasonId) {
            setCloseReason(initialState);
            return;
        }

        const fetchCloseReason = async () => {
            try {
                const { data } = await api.get(`/close-reasons/${closeReasonId}`);
                setCloseReason({
                    name: data.name || "",
                    description: data.description || "",
                    category: data.category || "positive",
                    color: data.color || "#4caf50",
                    order: data.order || 0,
                    formId: data.formId || "",
                    isActive: data.isActive ?? true,
                });
            } catch (err) {
                toastError(err);
            }
        };
        fetchCloseReason();
    }, [closeReasonId, open]);

    const handleClose = () => {
        setCloseReason(initialState);
        onClose();
    };

    const handleSaveCloseReason = async (values) => {
        try {
            const payload = {
                ...values,
                formId: values.formId || null,
            };

            if (closeReasonId) {
                await api.put(`/close-reasons/${closeReasonId}`, payload);
                toast.success(i18n.t("closeReasons.toasts.updated"));
            } else {
                await api.post("/close-reasons", payload);
                toast.success(i18n.t("closeReasons.toasts.created"));
            }
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle>
                {closeReasonId
                    ? i18n.t("closeReasons.modal.editTitle")
                    : i18n.t("closeReasons.modal.addTitle")}
            </DialogTitle>
            <Formik
                initialValues={closeReason}
                enableReinitialize
                validationSchema={CloseReasonSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        handleSaveCloseReason(values);
                        actions.setSubmitting(false);
                    }, 400);
                }}
            >
                {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                    <Form className={classes.form}>
                        <DialogContent dividers>
                            <Field
                                as={TextField}
                                label={i18n.t("closeReasons.modal.name")}
                                name="name"
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                variant="outlined"
                                fullWidth
                                margin="dense"
                            />
                            <Field
                                as={TextField}
                                label={i18n.t("closeReasons.modal.description")}
                                name="description"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                                multiline
                                rows={2}
                            />
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <InputLabel>{i18n.t("closeReasons.modal.category")}</InputLabel>
                                <Field
                                    as={Select}
                                    name="category"
                                    label={i18n.t("closeReasons.modal.category")}
                                >
                                    <MenuItem value="positive">
                                        🟢 {i18n.t("closeReasons.categories.positive")}
                                    </MenuItem>
                                    <MenuItem value="negative">
                                        🔴 {i18n.t("closeReasons.categories.negative")}
                                    </MenuItem>
                                </Field>
                            </FormControl>
                            <div className={classes.colorInput}>
                                <InputLabel>{i18n.t("closeReasons.modal.color")}</InputLabel>
                                <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                                    <span
                                        className={classes.colorPreview}
                                        style={{ backgroundColor: values.color }}
                                    />
                                    <Field
                                        as={TextField}
                                        type="color"
                                        name="color"
                                        variant="outlined"
                                        size="small"
                                        style={{ width: 80 }}
                                    />
                                </div>
                            </div>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <InputLabel>{i18n.t("closeReasons.modal.associatedForm")}</InputLabel>
                                <Field
                                    as={Select}
                                    name="formId"
                                    label={i18n.t("closeReasons.modal.associatedForm")}
                                    disabled={loadingForms}
                                >
                                    <MenuItem value="">
                                        {i18n.t("closeReasons.modal.noForm")}
                                    </MenuItem>
                                    {forms.map((form) => (
                                        <MenuItem key={form.id} value={form.id}>
                                            {form.name}
                                        </MenuItem>
                                    ))}
                                </Field>
                            </FormControl>
                            <Field
                                as={TextField}
                                label={i18n.t("closeReasons.modal.order")}
                                name="order"
                                type="number"
                                variant="outlined"
                                fullWidth
                                margin="dense"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.isActive}
                                        onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={i18n.t("closeReasons.modal.active")}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>
                                {i18n.t("closeReasons.modal.cancel")}
                            </Button>
                            <Button type="submit" color="primary" disabled={isSubmitting} variant="contained">
                                {isSubmitting ? (
                                    <CircularProgress size={24} />
                                ) : closeReasonId ? (
                                    i18n.t("closeReasons.modal.save")
                                ) : (
                                    i18n.t("closeReasons.modal.add")
                                )}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default CloseReasonModal;
