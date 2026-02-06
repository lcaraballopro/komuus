import React, { useState, useEffect, useReducer } from "react";
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
    InputAdornment,
    TextField,
    Chip,
} from "@material-ui/core";
import { Edit, DeleteOutline, Visibility, Assignment } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactFormModal from "../../components/ContactFormModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACT_FORMS") {
        const contactForms = action.payload;
        const newContactForms = [];

        contactForms.forEach((contactForm) => {
            const contactFormIndex = state.findIndex((c) => c.id === contactForm.id);
            if (contactFormIndex !== -1) {
                state[contactFormIndex] = contactForm;
            } else {
                newContactForms.push(contactForm);
            }
        });

        return [...state, ...newContactForms];
    }

    if (action.type === "UPDATE_CONTACT_FORM") {
        const contactForm = action.payload;
        const contactFormIndex = state.findIndex((c) => c.id === contactForm.id);

        if (contactFormIndex !== -1) {
            state[contactFormIndex] = contactForm;
            return [...state];
        } else {
            return [contactForm, ...state];
        }
    }

    if (action.type === "DELETE_CONTACT_FORM") {
        const contactFormId = action.payload;
        const contactFormIndex = state.findIndex((c) => c.id === contactFormId);
        if (contactFormIndex !== -1) {
            state.splice(contactFormIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }

    return state;
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    activeChip: {
        backgroundColor: theme.palette.success?.main || "#4caf50",
        color: "#fff",
    },
    inactiveChip: {
        backgroundColor: theme.palette.grey[500],
        color: "#fff",
    },
}));

const ContactForms = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchParam, setSearchParam] = useState("");
    const [contactForms, dispatch] = useReducer(reducer, []);
    const [selectedContactForm, setSelectedContactForm] = useState(null);
    const [contactFormModalOpen, setContactFormModalOpen] = useState(false);
    const [deletingContactForm, setDeletingContactForm] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContactForms = async () => {
                try {
                    const { data } = await api.get("/contact-forms", {
                        params: { searchParam, pageNumber },
                    });
                    dispatch({ type: "LOAD_CONTACT_FORMS", payload: data.contactForms });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchContactForms();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    useEffect(() => {
        const socket = openSocket();

        socket.on("contactForm", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_CONTACT_FORM", payload: data.contactForm });
            }

            if (data.action === "delete") {
                dispatch({
                    type: "DELETE_CONTACT_FORM",
                    payload: +data.formId,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleOpenContactFormModal = () => {
        setSelectedContactForm(null);
        setContactFormModalOpen(true);
    };

    const handleCloseContactFormModal = () => {
        setSelectedContactForm(null);
        setContactFormModalOpen(false);
    };

    const handleEditContactForm = (contactForm) => {
        setSelectedContactForm(contactForm);
        setContactFormModalOpen(true);
    };

    const handleDeleteContactForm = async (contactFormId) => {
        try {
            await api.delete(`/contact-forms/${contactFormId}`);
            toast.success(i18n.t("contactForms.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingContactForm(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={
                    deletingContactForm &&
                    `${i18n.t("contactForms.confirmationModal.deleteTitle")} ${deletingContactForm.name
                    }?`
                }
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteContactForm(deletingContactForm.id)}
            >
                {i18n.t("contactForms.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <ContactFormModal
                open={contactFormModalOpen}
                onClose={handleCloseContactFormModal}
                contactFormId={selectedContactForm && selectedContactForm.id}
            />
            <MainHeader>
                <Title>{i18n.t("contactForms.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("contactForms.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenContactFormModal}
                    >
                        {i18n.t("contactForms.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                {i18n.t("contactForms.table.name")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contactForms.table.fields")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contactForms.table.status")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contactForms.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {contactForms.map((contactForm) => (
                                <TableRow key={contactForm.id}>
                                    <TableCell align="left">
                                        <strong>{contactForm.name}</strong>
                                        {contactForm.description && (
                                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                                                {contactForm.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            icon={<Assignment />}
                                            label={contactForm.fields?.length || 0}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            label={contactForm.isActive
                                                ? i18n.t("contactForms.status.active")
                                                : i18n.t("contactForms.status.inactive")}
                                            className={contactForm.isActive
                                                ? classes.activeChip
                                                : classes.inactiveChip}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditContactForm(contactForm)}
                                        >
                                            <Edit />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setConfirmModalOpen(true);
                                                setDeletingContactForm(contactForm);
                                            }}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={4} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default ContactForms;
