import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Chip,
    Typography,
    makeStyles,
    CircularProgress,
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Collapse,
} from "@material-ui/core";
import { Close, Edit, Add, Delete, ExpandMore, ExpandLess } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        minWidth: 600,
        minHeight: 300,
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        padding: theme.spacing(4),
    },
    noUsers: {
        textAlign: "center",
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(2),
    },
    userCount: {
        color: theme.palette.text.secondary,
    },
    addForm: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
    formRow: {
        display: "flex",
        gap: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    formField: {
        flex: 1,
    },
    bulkSection: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: theme.spacing(1),
    },
    bulkTextarea: {
        width: "100%",
        minHeight: 100,
        fontFamily: "monospace",
        fontSize: 12,
    },
}));

const initialUserForm = {
    name: "",
    email: "",
    password: "",
    profile: "user",
};

const CompanyUsersModal = ({ open, onClose, company }) => {
    const classes = useStyles();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [userForm, setUserForm] = useState(initialUserForm);
    const [bulkText, setBulkText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = useCallback(async () => {
        if (!company?.id) return;

        setLoading(true);
        try {
            const { data } = await api.get(`/companies/${company.id}/users`);
            setUsers(data.users);
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        }
        setLoading(false);
    }, [company?.id]);

    useEffect(() => {
        if (open && company?.id) {
            fetchUsers();
        }
    }, [open, company?.id, fetchUsers]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async () => {
        if (!userForm.name || !userForm.email || !userForm.password) {
            toast.error(i18n.t("companyUsersModal.validation.required"));
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/companies/${company.id}/users`, userForm);
            toast.success(i18n.t("companyUsersModal.toasts.created"));
            setUserForm(initialUserForm);
            setShowAddForm(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        }
        setSubmitting(false);
    };

    const handleBulkCreate = async () => {
        if (!bulkText.trim()) {
            toast.error(i18n.t("companyUsersModal.validation.bulkEmpty"));
            return;
        }

        // Parse CSV format: name,email,password,profile
        const lines = bulkText.trim().split("\n").filter(l => l.trim());
        const usersToCreate = [];

        for (const line of lines) {
            const parts = line.split(",").map(p => p.trim());
            if (parts.length >= 3) {
                usersToCreate.push({
                    name: parts[0],
                    email: parts[1],
                    password: parts[2],
                    profile: parts[3] || "user"
                });
            }
        }

        if (usersToCreate.length === 0) {
            toast.error(i18n.t("companyUsersModal.validation.invalidFormat"));
            return;
        }

        setSubmitting(true);
        let created = 0;
        let errors = 0;

        for (const userData of usersToCreate) {
            try {
                await api.post(`/companies/${company.id}/users`, userData);
                created++;
            } catch {
                errors++;
            }
        }

        toast.success(i18n.t("companyUsersModal.toasts.bulkCreated", { created, errors }));
        setBulkText("");
        setShowBulkForm(false);
        fetchUsers();
        setSubmitting(false);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(i18n.t("companyUsersModal.confirmDelete"))) return;

        try {
            await api.delete(`/users/${userId}`);
            toast.success(i18n.t("companyUsersModal.toasts.deleted"));
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {i18n.t("companyUsersModal.title")} - {company?.name}
                <IconButton className={classes.closeButton} onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                {/* Header with add buttons */}
                <Box className={classes.header}>
                    <Typography className={classes.userCount}>
                        {users.length} {i18n.t("companyUsersModal.users")}
                    </Typography>
                    <Box>
                        <Button
                            size="small"
                            color="primary"
                            startIcon={<Add />}
                            onClick={() => { setShowAddForm(!showAddForm); setShowBulkForm(false); }}
                        >
                            {i18n.t("companyUsersModal.buttons.addUser")}
                        </Button>
                        <Button
                            size="small"
                            color="secondary"
                            onClick={() => { setShowBulkForm(!showBulkForm); setShowAddForm(false); }}
                        >
                            {i18n.t("companyUsersModal.buttons.bulkImport")}
                        </Button>
                    </Box>
                </Box>

                {/* Single user add form */}
                <Collapse in={showAddForm}>
                    <Box className={classes.addForm}>
                        <Typography variant="subtitle2" gutterBottom>
                            {i18n.t("companyUsersModal.addUser")}
                        </Typography>
                        <div className={classes.formRow}>
                            <TextField
                                className={classes.formField}
                                label={i18n.t("userModal.form.name")}
                                name="name"
                                value={userForm.name}
                                onChange={handleFormChange}
                                variant="outlined"
                                size="small"
                            />
                            <TextField
                                className={classes.formField}
                                label={i18n.t("userModal.form.email")}
                                name="email"
                                type="email"
                                value={userForm.email}
                                onChange={handleFormChange}
                                variant="outlined"
                                size="small"
                            />
                        </div>
                        <div className={classes.formRow}>
                            <TextField
                                className={classes.formField}
                                label={i18n.t("userModal.form.password")}
                                name="password"
                                type="password"
                                value={userForm.password}
                                onChange={handleFormChange}
                                variant="outlined"
                                size="small"
                            />
                            <FormControl className={classes.formField} variant="outlined" size="small">
                                <InputLabel>{i18n.t("userModal.form.profile")}</InputLabel>
                                <Select
                                    name="profile"
                                    value={userForm.profile}
                                    onChange={handleFormChange}
                                    label={i18n.t("userModal.form.profile")}
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateUser}
                            disabled={submitting}
                        >
                            {submitting ? <CircularProgress size={20} /> : i18n.t("companyUsersModal.buttons.create")}
                        </Button>
                    </Box>
                </Collapse>

                {/* Bulk import form */}
                <Collapse in={showBulkForm}>
                    <Box className={classes.bulkSection}>
                        <Typography variant="subtitle2" gutterBottom>
                            {i18n.t("companyUsersModal.bulkImport")}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                            {i18n.t("companyUsersModal.bulkFormat")}
                        </Typography>
                        <textarea
                            className={classes.bulkTextarea}
                            placeholder="Juan Pérez,juan@empresa.com,password123,user&#10;María García,maria@empresa.com,pass456,admin"
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                        />
                        <Box mt={1}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleBulkCreate}
                                disabled={submitting}
                            >
                                {submitting ? <CircularProgress size={20} /> : i18n.t("companyUsersModal.buttons.importAll")}
                            </Button>
                        </Box>
                    </Box>
                </Collapse>

                <Divider style={{ margin: "16px 0" }} />

                {/* Users table */}
                {loading ? (
                    <Box className={classes.loading}>
                        <CircularProgress />
                    </Box>
                ) : users.length === 0 ? (
                    <Typography className={classes.noUsers}>
                        {i18n.t("companyUsersModal.noUsers")}
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{i18n.t("users.table.name")}</TableCell>
                                <TableCell>{i18n.t("users.table.email")}</TableCell>
                                <TableCell align="center">{i18n.t("users.table.profile")}</TableCell>
                                <TableCell align="center">{i18n.t("users.table.actions")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={user.profile}
                                            size="small"
                                            color={user.profile === "admin" ? "primary" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteUser(user.id)}
                                            color="secondary"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CompanyUsersModal;
