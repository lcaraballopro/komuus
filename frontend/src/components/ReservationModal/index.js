import React, { useState, useEffect } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    makeStyles,
    CircularProgress,
} from "@material-ui/core";

import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
    colorInput: {
        width: 60,
        height: 36,
        padding: 0,
        border: "none",
        cursor: "pointer",
    },
    colorField: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
    },
}));

const initialState = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "pending",
    notes: "",
    color: "#2576d2",
    contactId: "",
    userId: "",
};

const ReservationModal = ({ open, onClose, reservationId }) => {
    const classes = useStyles();
    const [reservation, setReservation] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [contactSearch, setContactSearch] = useState("");

    useEffect(() => {
        if (!open) return;

        const fetchUsers = async () => {
            try {
                const { data } = await api.get("/users");
                setUsers(data.users || data);
            } catch (err) {
                toastError(err);
            }
        };
        fetchUsers();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (contactSearch.length < 2) return;

        const delayDebounce = setTimeout(async () => {
            try {
                const { data } = await api.get("/contacts", {
                    params: { searchParam: contactSearch },
                });
                setContacts(data.contacts || data);
            } catch (err) {
                toastError(err);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [contactSearch, open]);

    useEffect(() => {
        if (!open) return;

        if (reservationId) {
            const fetchReservation = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get(`/reservations/${reservationId}`);
                    setReservation({
                        title: data.title || "",
                        description: data.description || "",
                        startDate: data.startDate ? data.startDate.slice(0, 16) : "",
                        endDate: data.endDate ? data.endDate.slice(0, 16) : "",
                        status: data.status || "pending",
                        notes: data.notes || "",
                        color: data.color || "#2576d2",
                        contactId: data.contactId || "",
                        userId: data.userId || "",
                    });
                    if (data.contact) setSelectedContact(data.contact);
                    if (data.user) setSelectedUser(data.user);
                } catch (err) {
                    toastError(err);
                }
                setLoading(false);
            };
            fetchReservation();
        } else {
            setReservation(initialState);
            setSelectedContact(null);
            setSelectedUser(null);
        }
    }, [reservationId, open]);

    const handleChange = (e) => {
        setReservation((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            ...reservation,
            contactId: selectedContact?.id || null,
            userId: selectedUser?.id || null,
        };

        if (!payload.title || !payload.startDate || !payload.endDate) {
            toast.error(i18n.t("reservationModal.validation.required"));
            return;
        }

        if (new Date(payload.endDate) <= new Date(payload.startDate)) {
            toast.error(i18n.t("reservationModal.validation.dateOrder"));
            return;
        }

        setLoading(true);
        try {
            if (reservationId) {
                await api.put(`/reservations/${reservationId}`, payload);
                toast.success(i18n.t("reservationModal.success.edit"));
            } else {
                await api.post("/reservations", payload);
                toast.success(i18n.t("reservationModal.success.add"));
            }
            handleClose();
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    };

    const handleClose = () => {
        setReservation(initialState);
        setSelectedContact(null);
        setSelectedUser(null);
        setContacts([]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            scroll="paper"
        >
            <DialogTitle>
                {reservationId
                    ? i18n.t("reservationModal.title.edit")
                    : i18n.t("reservationModal.title.add")}
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label={i18n.t("reservationModal.form.title")}
                            name="title"
                            value={reservation.title}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={i18n.t("reservationModal.form.description")}
                            name="description"
                            value={reservation.description}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={i18n.t("reservationModal.form.startDate")}
                            name="startDate"
                            type="datetime-local"
                            value={reservation.startDate}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={i18n.t("reservationModal.form.endDate")}
                            name="endDate"
                            type="datetime-local"
                            value={reservation.endDate}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            label={i18n.t("reservationModal.form.status")}
                            name="status"
                            value={reservation.status}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="pending">{i18n.t("reservations.statuses.pending")}</MenuItem>
                            <MenuItem value="confirmed">{i18n.t("reservations.statuses.confirmed")}</MenuItem>
                            <MenuItem value="completed">{i18n.t("reservations.statuses.completed")}</MenuItem>
                            <MenuItem value="cancelled">{i18n.t("reservations.statuses.cancelled")}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <div className={classes.colorField}>
                            <TextField
                                label={i18n.t("reservationModal.form.color")}
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={reservation.color}
                                InputProps={{
                                    readOnly: true,
                                    startAdornment: (
                                        <input
                                            type="color"
                                            value={reservation.color}
                                            onChange={(e) =>
                                                setReservation((prev) => ({
                                                    ...prev,
                                                    color: e.target.value,
                                                }))
                                            }
                                            className={classes.colorInput}
                                        />
                                    ),
                                }}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={contacts}
                            value={selectedContact}
                            getOptionLabel={(opt) =>
                                opt ? `${opt.name} (${opt.number})` : ""
                            }
                            onChange={(e, newVal) => setSelectedContact(newVal)}
                            onInputChange={(e, val) => setContactSearch(val)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={i18n.t("reservationModal.form.contact")}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                />
                            )}
                            noOptionsText={i18n.t("reservationModal.form.noContact")}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label={i18n.t("reservationModal.form.agent")}
                            name="userId"
                            value={selectedUser?.id || ""}
                            onChange={(e) => {
                                const u = users.find((u) => u.id === Number(e.target.value));
                                setSelectedUser(u || null);
                            }}
                            variant="outlined"
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">{i18n.t("reservationModal.form.noAgent")}</MenuItem>
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={i18n.t("reservationModal.form.notes")}
                            name="notes"
                            value={reservation.notes}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    {i18n.t("reservationModal.buttons.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : reservationId ? (
                        i18n.t("reservationModal.buttons.okEdit")
                    ) : (
                        i18n.t("reservationModal.buttons.okAdd")
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReservationModal;
