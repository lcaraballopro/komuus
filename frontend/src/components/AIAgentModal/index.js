import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    root: { display: "flex", flexWrap: "wrap" },
    textField: { marginRight: theme.spacing(1), flex: 1 },
    btnWrapper: { position: "relative" },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));

const AIAgentSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
    webhookUrl: Yup.string().url("Must be a valid URL").required("Required"),
    apiToken: Yup.string(),
    isActive: Yup.boolean(),
});

const AIAgentModal = ({ open, onClose, agentId }) => {
    const classes = useStyles();
    const initialState = { name: "", webhookUrl: "", apiToken: "", isActive: true };
    const [agent, setAgent] = useState(initialState);

    useEffect(() => {
        (async () => {
            if (!agentId) return;
            try {
                const { data } = await api.get(`/ai-agents/${agentId}`);
                setAgent((prevState) => ({ ...prevState, ...data }));
            } catch (err) {
                toastError(err);
            }
        })();
        return () => setAgent(initialState);
    }, [agentId, open]);

    const handleClose = () => {
        onClose();
        setAgent(initialState);
    };

    const handleSaveAgent = async (values) => {
        try {
            if (agentId) {
                await api.put(`/ai-agents/${agentId}`, values);
            } else {
                await api.post("/ai-agents", values);
            }
            toast.success(i18n.t("aiAgents.toasts.saved"));
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <div className={classes.root}>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
                <DialogTitle>
                    {agentId ? i18n.t("aiAgentModal.title.edit") : i18n.t("aiAgentModal.title.add")}
                </DialogTitle>
                <Formik
                    initialValues={agent}
                    enableReinitialize={true}
                    validationSchema={AIAgentSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveAgent(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <DialogContent dividers>
                                <Field
                                    as={TextField}
                                    label={i18n.t("aiAgentModal.form.name")}
                                    autoFocus
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                                <Field
                                    as={TextField}
                                    label={i18n.t("aiAgentModal.form.webhookUrl")}
                                    name="webhookUrl"
                                    error={touched.webhookUrl && Boolean(errors.webhookUrl)}
                                    helperText={touched.webhookUrl && errors.webhookUrl}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    placeholder="https://n8n.example.com/webhook/..."
                                />
                                <Field
                                    as={TextField}
                                    label={i18n.t("aiAgentModal.form.apiToken")}
                                    name="apiToken"
                                    error={touched.apiToken && Boolean(errors.apiToken)}
                                    helperText={touched.apiToken && errors.apiToken}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    placeholder="Optional: Bearer token for authentication"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.isActive}
                                            onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={i18n.t("aiAgentModal.form.isActive")}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="secondary" disabled={isSubmitting} variant="outlined">
                                    {i18n.t("aiAgentModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {agentId ? i18n.t("aiAgentModal.buttons.okEdit") : i18n.t("aiAgentModal.buttons.okAdd")}
                                    {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default AIAgentModal;
