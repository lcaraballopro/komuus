import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, FieldArray } from "formik";
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
    FormControlLabel,
    Switch,
    IconButton,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
} from "@material-ui/core";
import { Add, Delete, DragIndicator } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    textField: {
        marginRight: theme.spacing(1),
        flex: 1,
    },
    fieldsContainer: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    fieldItem: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(1),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        border: `1px solid ${theme.palette.divider}`,
    },
    fieldHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.spacing(1),
    },
    optionsField: {
        marginTop: theme.spacing(1),
    },
    addFieldButton: {
        marginTop: theme.spacing(1),
    },
}));

const fieldTypes = [
    { value: "text", label: "Texto" },
    { value: "textarea", label: "Área de texto" },
    { value: "select", label: "Lista desplegable" },
    { value: "checkbox", label: "Casilla de verificación" },
    { value: "date", label: "Fecha" },
    { value: "email", label: "Correo electrónico" },
    { value: "phone", label: "Teléfono" },
    { value: "number", label: "Número" },
];

const ContactFormSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Muy corto")
        .max(100, "Muy largo")
        .required("Requerido"),
    description: Yup.string(),
    isActive: Yup.boolean(),
    fields: Yup.array().of(
        Yup.object().shape({
            type: Yup.string().required("Requerido"),
            label: Yup.string().required("Requerido"),
            placeholder: Yup.string(),
            options: Yup.array().of(Yup.string()),
            isRequired: Yup.boolean(),
        })
    ),
});

const ContactFormModal = ({ open, onClose, contactFormId, whatsappId }) => {
    const classes = useStyles();

    const [contactForm, setContactForm] = useState({
        name: "",
        description: "",
        isActive: true,
        fields: [],
    });

    useEffect(() => {
        const fetchContactForm = async () => {
            if (!contactFormId) {
                setContactForm({
                    name: "",
                    description: "",
                    isActive: true,
                    fields: [],
                });
                return;
            }

            try {
                const { data } = await api.get(`/contact-forms/${contactFormId}`);
                setContactForm({
                    name: data.name,
                    description: data.description || "",
                    isActive: data.isActive,
                    fields: data.fields || [],
                });
            } catch (err) {
                toastError(err);
            }
        };

        fetchContactForm();
    }, [contactFormId, open]);

    const handleClose = () => {
        onClose();
        setContactForm({
            name: "",
            description: "",
            isActive: true,
            fields: [],
        });
    };

    const handleSaveContactForm = async (values) => {
        try {
            const payload = { ...values, whatsappId };
            if (contactFormId) {
                await api.put(`/contact-forms/${contactFormId}`, payload);
                toast.success(i18n.t("contactFormModal.success.edit"));
            } else {
                await api.post("/contact-forms", payload);
                toast.success(i18n.t("contactFormModal.success.add"));
            }
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    const newField = {
        type: "text",
        label: "",
        placeholder: "",
        options: [],
        isRequired: false,
        order: 0,
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle>
                {contactFormId
                    ? i18n.t("contactFormModal.title.edit")
                    : i18n.t("contactFormModal.title.add")}
            </DialogTitle>
            <Formik
                initialValues={contactForm}
                enableReinitialize={true}
                validationSchema={ContactFormSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        handleSaveContactForm(values);
                        actions.setSubmitting(false);
                    }, 400);
                }}
            >
                {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={8}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("contactFormModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        fullWidth
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={values.isActive}
                                                onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={i18n.t("contactFormModal.form.active")}
                                        style={{ marginTop: 8 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("contactFormModal.form.description")}
                                        name="description"
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                            </Grid>

                            <Divider style={{ margin: "16px 0" }} />

                            <Typography variant="h6" gutterBottom>
                                {i18n.t("contactFormModal.form.fields")}
                            </Typography>

                            <FieldArray name="fields">
                                {({ push, remove }) => (
                                    <div className={classes.fieldsContainer}>
                                        {values.fields.map((field, index) => (
                                            <Paper key={index} className={classes.fieldItem} elevation={0}>
                                                <div className={classes.fieldHeader}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <DragIndicator style={{ color: "#999", marginRight: 8 }} />
                                                        <Typography variant="subtitle2">
                                                            {i18n.t("contactFormModal.form.field")} {index + 1}
                                                        </Typography>
                                                    </div>
                                                    <IconButton size="small" onClick={() => remove(index)}>
                                                        <Delete />
                                                    </IconButton>
                                                </div>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={4}>
                                                        <FormControl variant="outlined" fullWidth size="small">
                                                            <InputLabel>
                                                                {i18n.t("contactFormModal.form.fieldType")}
                                                            </InputLabel>
                                                            <Select
                                                                value={field.type}
                                                                onChange={(e) =>
                                                                    setFieldValue(`fields.${index}.type`, e.target.value)
                                                                }
                                                                label={i18n.t("contactFormModal.form.fieldType")}
                                                            >
                                                                {fieldTypes.map((type) => (
                                                                    <MenuItem key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={5}>
                                                        <Field
                                                            as={TextField}
                                                            label={i18n.t("contactFormModal.form.fieldLabel")}
                                                            name={`fields.${index}.label`}
                                                            variant="outlined"
                                                            fullWidth
                                                            size="small"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={field.isRequired}
                                                                    onChange={(e) =>
                                                                        setFieldValue(
                                                                            `fields.${index}.isRequired`,
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    color="primary"
                                                                    size="small"
                                                                />
                                                            }
                                                            label={i18n.t("contactFormModal.form.required")}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Field
                                                            as={TextField}
                                                            label={i18n.t("contactFormModal.form.placeholder")}
                                                            name={`fields.${index}.placeholder`}
                                                            variant="outlined"
                                                            fullWidth
                                                            size="small"
                                                        />
                                                    </Grid>
                                                    {field.type === "select" && (
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                label={i18n.t("contactFormModal.form.options")}
                                                                variant="outlined"
                                                                fullWidth
                                                                size="small"
                                                                helperText={i18n.t("contactFormModal.form.optionsHelp")}
                                                                value={(field.options || []).join(", ")}
                                                                onChange={(e) => {
                                                                    const options = e.target.value
                                                                        .split(",")
                                                                        .map((opt) => opt.trim())
                                                                        .filter((opt) => opt);
                                                                    setFieldValue(`fields.${index}.options`, options);
                                                                }}
                                                            />
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Paper>
                                        ))}

                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<Add />}
                                            onClick={() => push({ ...newField, order: values.fields.length })}
                                            className={classes.addFieldButton}
                                        >
                                            {i18n.t("contactFormModal.buttons.addField")}
                                        </Button>
                                    </div>
                                )}
                            </FieldArray>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleClose}
                                color="secondary"
                                disabled={isSubmitting}
                            >
                                {i18n.t("contactFormModal.buttons.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                disabled={isSubmitting}
                                variant="contained"
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} />
                                ) : contactFormId ? (
                                    i18n.t("contactFormModal.buttons.okEdit")
                                ) : (
                                    i18n.t("contactFormModal.buttons.okAdd")
                                )}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default ContactFormModal;
