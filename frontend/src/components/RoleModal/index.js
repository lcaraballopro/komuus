import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    makeStyles,
    Typography,
    Checkbox,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    CircularProgress,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        minWidth: 500,
    },
    textField: {
        marginBottom: theme.spacing(2),
    },
    permissionsSection: {
        marginTop: theme.spacing(2),
    },
    accordion: {
        marginBottom: theme.spacing(1),
    },
    accordionDetails: {
        display: "flex",
        flexDirection: "column",
    },
    moduleTitle: {
        textTransform: "capitalize",
        fontWeight: 500,
    },
    selectAll: {
        marginBottom: theme.spacing(1),
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: theme.spacing(1),
    },
}));

const moduleTranslations = {
    tickets: "Conversaciones",
    contacts: "Contactos",
    users: "Usuarios",
    queues: "Colas",
    connections: "Conexiones",
    quickAnswers: "Respuestas Rápidas",
    settings: "Configuración",
    reports: "Reportes",
    campaigns: "Campañas",
    aiAgents: "Agentes IA",
};

const RoleModal = ({ open, onClose, roleId }) => {
    const classes = useStyles();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const { data } = await api.get("/permissions");
                setAllPermissions(data);
            } catch (err) {
                toastError(err);
            }
        };

        if (open) {
            fetchPermissions();
        }
    }, [open]);

    useEffect(() => {
        const fetchRole = async () => {
            if (!roleId) {
                setName("");
                setDescription("");
                setSelectedPermissions([]);
                return;
            }

            setLoading(true);
            try {
                const { data } = await api.get(`/roles/${roleId}`);
                setName(data.name);
                setDescription(data.description || "");
                setSelectedPermissions(data.permissions?.map(p => p.id) || []);
            } catch (err) {
                toastError(err);
            }
            setLoading(false);
        };

        if (open) {
            fetchRole();
        }
    }, [open, roleId]);

    const handleTogglePermission = (permissionId) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId);
            }
            return [...prev, permissionId];
        });
    };

    const handleToggleModule = (module) => {
        const modulePerms = allPermissions
            .find(m => m.module === module)
            ?.permissions.map(p => p.id) || [];

        const allSelected = modulePerms.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(id => !modulePerms.includes(id)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...modulePerms])]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        setSaving(true);
        try {
            if (roleId) {
                await api.put(`/roles/${roleId}`, {
                    name,
                    description,
                    permissionIds: selectedPermissions,
                });
                toast.success(i18n.t("roles.toasts.updated"));
            } else {
                await api.post("/roles", {
                    name,
                    description,
                    permissionIds: selectedPermissions,
                });
                toast.success(i18n.t("roles.toasts.created"));
            }
            onClose();
        } catch (err) {
            toastError(err);
        }
        setSaving(false);
    };

    const isModuleFullySelected = (module) => {
        const modulePerms = allPermissions
            .find(m => m.module === module)
            ?.permissions.map(p => p.id) || [];
        return modulePerms.length > 0 && modulePerms.every(id => selectedPermissions.includes(id));
    };

    const isModulePartiallySelected = (module) => {
        const modulePerms = allPermissions
            .find(m => m.module === module)
            ?.permissions.map(p => p.id) || [];
        const selectedCount = modulePerms.filter(id => selectedPermissions.includes(id)).length;
        return selectedCount > 0 && selectedCount < modulePerms.length;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle>
                {roleId
                    ? i18n.t("roleModal.title.edit")
                    : i18n.t("roleModal.title.add")}
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TextField
                            label={i18n.t("roleModal.form.name")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className={classes.textField}
                            autoFocus
                        />
                        <TextField
                            label={i18n.t("roleModal.form.description")}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className={classes.textField}
                            multiline
                            rows={2}
                        />

                        <Typography variant="h6" className={classes.permissionsSection}>
                            {i18n.t("roleModal.form.permissions")}
                        </Typography>

                        {allPermissions.map((moduleGroup) => (
                            <Accordion
                                key={moduleGroup.module}
                                className={classes.accordion}
                            >
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <FormControlLabel
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.stopPropagation()}
                                        control={
                                            <Checkbox
                                                checked={isModuleFullySelected(moduleGroup.module)}
                                                indeterminate={isModulePartiallySelected(moduleGroup.module)}
                                                onChange={() => handleToggleModule(moduleGroup.module)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography className={classes.moduleTitle}>
                                                {moduleTranslations[moduleGroup.module] || moduleGroup.module}
                                            </Typography>
                                        }
                                    />
                                </AccordionSummary>
                                <AccordionDetails className={classes.accordionDetails}>
                                    {moduleGroup.permissions.map((permission) => (
                                        <FormControlLabel
                                            key={permission.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={() => handleTogglePermission(permission.id)}
                                                    color="primary"
                                                />
                                            }
                                            label={`${permission.name} - ${permission.description}`}
                                        />
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    {i18n.t("roleModal.buttons.cancel")}
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={saving || loading}
                >
                    {saving ? <CircularProgress size={20} /> : i18n.t("roleModal.buttons.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoleModal;
