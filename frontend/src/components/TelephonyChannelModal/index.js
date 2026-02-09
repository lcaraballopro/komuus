import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const ChannelSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    trunkUsername: Yup.string().required("Required"),
    trunkPassword: Yup.string().required("Required"),
    trunkDomain: Yup.string().required("Required"),
});

const TelephonyChannelModal = ({ open, onClose, channelId }) => {
    const initialState = {
        name: "",
        trunkUsername: "",
        trunkPassword: "",
        trunkDomain: "",
        queueId: "",
    };

    const [channel, setChannel] = useState(initialState);
    const [queues, setQueues] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/queue");
                setQueues(data);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

    useEffect(() => {
        const fetchChannel = async () => {
            if (!channelId) {
                setChannel(initialState);
                return;
            }
            try {
                const { data } = await api.get(`/telephony/${channelId}`);
                setChannel(data);
            } catch (err) {
                toastError(err);
            }
        };

        if (open) {
            fetchChannel();
        }
    }, [channelId, open]);

    const handleClose = () => {
        onClose();
        setChannel(initialState);
    };

    const handleSaveChannel = async (values) => {
        try {
            if (channelId) {
                await api.put(`/telephony/${channelId}`, values);
                toast.success(i18n.t("telephony.toasts.updated"));
            } else {
                await api.post("/telephony", values);
                toast.success(i18n.t("telephony.toasts.created"));
            }
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {channelId
                    ? i18n.t("telephony.modal.titleEdit")
                    : i18n.t("telephony.modal.titleAdd")}
            </DialogTitle>
            <Formik
                initialValues={channel}
                enableReinitialize={true}
                validationSchema={ChannelSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        handleSaveChannel(values);
                        actions.setSubmitting(false);
                    }, 400);
                }}
            >
                {({ touched, errors, isSubmitting, values, handleChange }) => (
                    <Form>
                        <DialogContent dividers>
                            <Field
                                as={TextField}
                                label={i18n.t("telephony.modal.name")}
                                name="name"
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                variant="outlined"
                                margin="dense"
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                label={i18n.t("telephony.modal.trunkUsername")}
                                name="trunkUsername"
                                error={touched.trunkUsername && Boolean(errors.trunkUsername)}
                                helperText={touched.trunkUsername && errors.trunkUsername}
                                variant="outlined"
                                margin="dense"
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                label={i18n.t("telephony.modal.trunkPassword")}
                                name="trunkPassword"
                                type="password"
                                error={touched.trunkPassword && Boolean(errors.trunkPassword)}
                                helperText={touched.trunkPassword && errors.trunkPassword}
                                variant="outlined"
                                margin="dense"
                                fullWidth
                            />
                            <Field
                                as={TextField}
                                label={i18n.t("telephony.modal.trunkDomain")}
                                name="trunkDomain"
                                error={touched.trunkDomain && Boolean(errors.trunkDomain)}
                                helperText={touched.trunkDomain && errors.trunkDomain}
                                variant="outlined"
                                margin="dense"
                                fullWidth
                                placeholder="e.g. sip.twilio.com"
                            />
                            <FormControl
                                variant="outlined"
                                margin="dense"
                                fullWidth
                            >
                                <InputLabel id="queue-selection-label">
                                    {i18n.t("telephony.modal.queue")}
                                </InputLabel>
                                <Field
                                    as={Select}
                                    labelId="queue-selection-label"
                                    id="queueId"
                                    name="queueId"
                                    value={values.queueId || ""}
                                    onChange={handleChange}
                                    label={i18n.t("telephony.modal.queue")}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {queues.map((queue) => (
                                        <MenuItem key={queue.id} value={queue.id}>
                                            {queue.name}
                                        </MenuItem>
                                    ))}
                                </Field>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleClose}
                                color="secondary"
                                disabled={isSubmitting}
                                variant="outlined"
                            >
                                {i18n.t("telephony.modal.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                disabled={isSubmitting}
                                variant="contained"
                                className={isSubmitting ? "loading" : ""}
                            >
                                {i18n.t("telephony.modal.save")}
                                {isSubmitting && (
                                    <CircularProgress
                                        size={24}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            marginTop: -12,
                                            marginLeft: -12,
                                        }}
                                    />
                                )}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default TelephonyChannelModal;
