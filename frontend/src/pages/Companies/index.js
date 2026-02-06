import React, { useState, useEffect, useReducer, useCallback } from "react";
import openSocket from "../../services/socket-io";
import {
    Button,
    IconButton,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Switch,
} from "@material-ui/core";
import { DeleteOutline, Edit, Business, PeopleAlt } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CompanyModal from "../../components/CompanyModal";
import CompanyUsersModal from "../../components/CompanyUsersModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    customTableCell: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
}));

const reducer = (state, action) => {
    if (action.type === "LOAD_COMPANIES") {
        const companies = action.payload;
        const newCompanies = [];

        companies.forEach((company) => {
            const companyIndex = state.findIndex((c) => c.id === company.id);
            if (companyIndex !== -1) {
                state[companyIndex] = company;
            } else {
                newCompanies.push(company);
            }
        });

        return [...state, ...newCompanies];
    }

    if (action.type === "UPDATE_COMPANY") {
        const company = action.payload;
        const companyIndex = state.findIndex((c) => c.id === company.id);

        if (companyIndex !== -1) {
            state[companyIndex] = company;
            return [...state];
        } else {
            return [company, ...state];
        }
    }

    if (action.type === "DELETE_COMPANY") {
        const companyId = action.payload;
        const companyIndex = state.findIndex((c) => c.id === companyId);
        if (companyIndex !== -1) {
            state.splice(companyIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const Companies = () => {
    const classes = useStyles();

    const [companies, dispatch] = useReducer(reducer, []);
    const [loading, setLoading] = useState(false);
    const [companyModalOpen, setCompanyModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deletingCompany, setDeletingCompany] = useState(null);
    const [usersModalOpen, setUsersModalOpen] = useState(false);
    const [usersCompany, setUsersCompany] = useState(null);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/companies");
            dispatch({ type: "LOAD_COMPANIES", payload: data.companies });
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        const socket = openSocket();

        socket.on("company", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_COMPANY", payload: data.company });
            }
            if (data.action === "delete") {
                dispatch({ type: "DELETE_COMPANY", payload: data.companyId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(true);
    };

    const handleCloseCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(false);
    };

    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setCompanyModalOpen(true);
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await api.delete(`/companies/${companyId}`);
            toast.success(i18n.t("companies.toasts.deleted"));
        } catch (err) {
            toast.error(err.message);
        }
        setDeletingCompany(null);
    };

    const handleViewUsers = (company) => {
        setUsersCompany(company);
        setUsersModalOpen(true);
    };

    return (
        <MainContainer>
            <CompanyModal
                open={companyModalOpen}
                onClose={handleCloseCompanyModal}
                companyId={selectedCompany?.id}
            />
            <CompanyUsersModal
                open={usersModalOpen}
                onClose={() => setUsersModalOpen(false)}
                company={usersCompany}
            />
            <ConfirmationModal
                title={
                    deletingCompany &&
                    `${i18n.t("companies.confirmationModal.deleteTitle")} ${deletingCompany.name}?`
                }
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteCompany(deletingCompany.id)}
            >
                {i18n.t("companies.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <MainHeader>
                <Title>{i18n.t("companies.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenCompanyModal}
                    >
                        {i18n.t("companies.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">
                                {i18n.t("companies.table.name")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("companies.table.slug")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("companies.table.plan")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("companies.table.status")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("companies.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRowSkeleton columns={5} />
                        ) : (
                            companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell align="center">
                                        <Business style={{ marginRight: 8, verticalAlign: "middle" }} />
                                        {company.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={company.slug} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={company.plan}
                                            size="small"
                                            color={company.plan === "enterprise" ? "primary" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={company.isActive ? i18n.t("companies.table.active") : i18n.t("companies.table.inactive")}
                                            size="small"
                                            color={company.isActive ? "primary" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewUsers(company)}
                                            title={i18n.t("companies.buttons.viewUsers")}
                                        >
                                            <PeopleAlt />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditCompany(company)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setConfirmModalOpen(true);
                                                setDeletingCompany(company);
                                            }}
                                            disabled={company.slug === "default"}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Companies;
