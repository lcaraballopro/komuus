import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    MenuItem,
    CircularProgress,
    Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
    colorField: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2)
    },
    colorPicker: {
        width: 50,
        height: 40,
        border: "none",
        borderRadius: theme.shape.borderRadius,
        cursor: "pointer"
    },
    preview: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: "#f5f5f5",
        borderRadius: theme.shape.borderRadius
    },
    previewButton: {
        width: 50,
        height: 50,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }
}));

const initialValues = {
    name: "",
    isActive: true,
    primaryColor: "#6366f1",
    position: "bottom-right",
    welcomeMessage: "",
    offlineMessage: "",
    buttonText: "Chat",
    allowedDomains: ""
};

const WebchatChannelModal = ({ open, onClose, channelId }) => {
    const classes = useStyles();
    const [values, setValues] = useState(initialValues);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setValues(initialValues);
            return;
        }

        if (!channelId) {
            setValues(initialValues);
            return;
        }

        const fetchChannel = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/webchat-channels/${channelId}`);
                setValues({
                    ...data,
                    allowedDomains: (data.allowedDomains || []).join(", ")
                });
            } catch (err) {
                toast.error("Error loading channel");
            }
            setLoading(false);
        };

        fetchChannel();
    }, [channelId, open]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async () => {
        if (!values.name.trim()) {
            toast.error("Name is required");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...values,
                allowedDomains: values.allowedDomains
                    ? values.allowedDomains.split(",").map((d) => d.trim()).filter(Boolean)
                    : []
            };

            if (channelId) {
                await api.put(`/webchat-channels/${channelId}`, payload);
                toast.success("Channel updated successfully");
            } else {
                await api.post("/webchat-channels", payload);
                toast.success("Channel created successfully");
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error saving channel");
        }
        setSubmitting(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {channelId
                    ? i18n.t("webchatChannels.modal.titleEdit")
                    : i18n.t("webchatChannels.modal.titleAdd")}
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="name"
                                label={i18n.t("webchatChannels.modal.name")}
                                value={values.name}
                                onChange={handleChange}
                                variant="outlined"
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.isActive}
                                        onChange={handleChange}
                                        name="isActive"
                                        color="primary"
                                    />
                                }
                                label={i18n.t("webchatChannels.modal.active")}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <div className={classes.colorField}>
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={values.primaryColor}
                                    onChange={handleChange}
                                    className={classes.colorPicker}
                                />
                                <TextField
                                    fullWidth
                                    name="primaryColor"
                                    label={i18n.t("webchatChannels.modal.color")}
                                    value={values.primaryColor}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                name="position"
                                label={i18n.t("webchatChannels.modal.position")}
                                value={values.position}
                                onChange={handleChange}
                                variant="outlined"
                            >
                                <MenuItem value="bottom-right">Bottom Right</MenuItem>
                                <MenuItem value="bottom-left">Bottom Left</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="buttonText"
                                label={i18n.t("webchatChannels.modal.buttonText")}
                                value={values.buttonText}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="welcomeMessage"
                                label={i18n.t("webchatChannels.modal.welcomeMessage")}
                                value={values.welcomeMessage}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="Hello! How can I help you today?"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                name="offlineMessage"
                                label={i18n.t("webchatChannels.modal.offlineMessage")}
                                value={values.offlineMessage}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="We're currently offline. Leave a message!"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="allowedDomains"
                                label={i18n.t("webchatChannels.modal.allowedDomains")}
                                value={values.allowedDomains}
                                onChange={handleChange}
                                variant="outlined"
                                helperText="Comma-separated list of domains (e.g., example.com, mysite.com). Leave empty to allow all."
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Preview
                            </Typography>
                            <div className={classes.preview}>
                                <div
                                    className={classes.previewButton}
                                    style={{
                                        backgroundColor: values.primaryColor,
                                        float: values.position === "bottom-left" ? "left" : "right"
                                    }}
                                >
                                    💬
                                </div>
                                <div style={{ clear: "both" }} />
                            </div>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>
                    {i18n.t("webchatChannels.modal.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={submitting || loading}
                >
                    {submitting ? <CircularProgress size={24} /> : i18n.t("webchatChannels.modal.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WebchatChannelModal;
