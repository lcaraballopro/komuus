import React, { useState, useEffect, useCallback } from "react";
import {
    makeStyles,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Typography,
    Button,
    Chip,
} from "@material-ui/core";
import { Add, Edit, Delete } from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import RoleModal from "../../components/RoleModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        overflowY: "auto",
    },
    tableContainer: {
        marginTop: theme.spacing(2),
    },
    systemChip: {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        fontSize: "0.7rem",
    },
    customChip: {
        backgroundColor: theme.palette.grey[500],
        color: "#fff",
        fontSize: "0.7rem",
    },
}));

const Roles = () => {
    const classes = useStyles();

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/roles");
            setRoles(data);
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleOpenRoleModal = (role = null) => {
        setSelectedRole(role);
        setRoleModalOpen(true);
    };

    const handleCloseRoleModal = () => {
        setSelectedRole(null);
        setRoleModalOpen(false);
        fetchRoles();
    };

    const handleDeleteRole = async (roleId) => {
        try {
            await api.delete(`/roles/${roleId}`);
            toast.success(i18n.t("roles.toasts.deleted"));
            fetchRoles();
        } catch (err) {
            toastError(err);
        }
        setDeletingRole(null);
    };

    const handleOpenConfirmModal = (role) => {
        setDeletingRole(role);
        setConfirmModalOpen(true);
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={i18n.t("roles.confirmationModal.deleteTitle")}
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => handleDeleteRole(deletingRole?.id)}
            >
                {i18n.t("roles.confirmationModal.deleteMessage")}
            </ConfirmationModal>

            <RoleModal
                open={roleModalOpen}
                onClose={handleCloseRoleModal}
                roleId={selectedRole?.id}
            />

            <MainHeader>
                <Title>{i18n.t("roles.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenRoleModal()}
                    >
                        <Add />
                        {i18n.t("roles.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>

            <Paper className={classes.mainPaper} variant="outlined">
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {i18n.t("roles.subtitle")}
                </Typography>

                <Table size="small" className={classes.tableContainer}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{i18n.t("roles.table.name")}</TableCell>
                            <TableCell>{i18n.t("roles.table.description")}</TableCell>
                            <TableCell align="center">{i18n.t("roles.table.system")}</TableCell>
                            <TableCell align="center">{i18n.t("roles.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <strong>{role.name}</strong>
                                </TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={role.isSystem ? "Sistema" : "Personalizado"}
                                        size="small"
                                        className={role.isSystem ? classes.systemChip : classes.customChip}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenRoleModal(role)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    {!role.isSystem && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenConfirmModal(role)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Roles;
