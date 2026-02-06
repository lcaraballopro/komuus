import React, { useState, useContext, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
    makeStyles,
    IconButton,
    InputBase,
    Badge,
    Tooltip,
    Avatar,
    Fade,
    ClickAwayListener,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    useMediaQuery,
    useTheme,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CloseIcon from "@material-ui/icons/Close";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ContactPhoneIcon from "@material-ui/icons/ContactPhone";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import { AuthContext } from "../../context/Auth/AuthContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { i18n } from "../../translate/i18n";
import NewTicketModal from "../NewTicketModal";
import ContactModal from "../ContactModal";

// Logo from public folder (Vite resolves this at build time)
const logo = "/lgokomu.png";

const useStyles = makeStyles((theme) => ({
    toolbar: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        backgroundColor: "rgba(20, 20, 30, 0.98)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing(0, 2),
        zIndex: theme.zIndex.drawer + 3,
        boxShadow: "0 2px 16px rgba(0, 0, 0, 0.25)",
        [theme.breakpoints.down("sm")]: {
            height: 48,
            padding: theme.spacing(0, 1),
        },
    },
    leftSection: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2),
        [theme.breakpoints.down("sm")]: {
            gap: theme.spacing(1),
        },
    },
    logo: {
        height: 28,
        [theme.breakpoints.down("sm")]: {
            height: 24,
        },
    },
    statusIndicators: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(0.5),
        [theme.breakpoints.down("sm")]: {
            display: "none",
        },
    },
    statusChip: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: theme.spacing(0.5, 1),
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 500,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        color: "rgba(255, 255, 255, 0.85)",
    },
    statusDot: {
        fontSize: 10,
    },
    statusConnected: {
        color: "#4caf50",
    },
    statusDisconnected: {
        color: "#f44336",
    },
    centerSection: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        maxWidth: 480,
        margin: "0 auto",
        [theme.breakpoints.down("sm")]: {
            maxWidth: "100%",
            margin: theme.spacing(0, 1),
        },
    },
    searchContainer: {
        position: "relative",
        width: "100%",
    },
    searchInput: {
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 24,
        padding: theme.spacing(0.75, 2),
        paddingLeft: theme.spacing(5),
        fontSize: 14,
        color: "#fff",
        transition: "all 0.2s ease",
        border: "1px solid transparent",
        "&::placeholder": {
            color: "rgba(255, 255, 255, 0.5)",
        },
        "&:focus-within": {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: `1px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 0 3px ${theme.palette.primary.main}40`,
        },
    },
    searchIcon: {
        position: "absolute",
        left: theme.spacing(1.5),
        top: "50%",
        transform: "translateY(-50%)",
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 20,
    },
    searchShortcut: {
        position: "absolute",
        right: theme.spacing(1.5),
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.5)",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        padding: "2px 6px",
        borderRadius: 4,
        fontFamily: "monospace",
        [theme.breakpoints.down("sm")]: {
            display: "none",
        },
    },
    searchResults: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        maxHeight: 400,
        overflow: "auto",
        zIndex: 1000,
    },
    searchCategory: {
        padding: theme.spacing(1, 2),
        color: theme.palette.text.secondary,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    searchItem: {
        borderRadius: 8,
        margin: theme.spacing(0.5, 1),
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
        },
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(0.5),
    },
    actionButton: {
        padding: theme.spacing(1),
        borderRadius: 10,
        color: "rgba(255, 255, 255, 0.8)",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "#fff",
        },
    },
    avatar: {
        width: 32,
        height: 32,
        fontSize: 14,
        backgroundColor: theme.palette.primary.main,
        cursor: "pointer",
        transition: "transform 0.2s ease",
        "&:hover": {
            transform: "scale(1.1)",
        },
    },
    // Mobile notification pull indicator
    pullIndicator: {
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 40,
        height: 4,
        backgroundColor: theme.palette.text.disabled,
        borderRadius: 2,
        zIndex: theme.zIndex.drawer + 4,
        opacity: 0,
        transition: "opacity 0.2s ease",
    },
    pullIndicatorVisible: {
        opacity: 1,
    },
}));

const TopToolbar = ({ onSwipeDown }) => {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { user } = useContext(AuthContext);
    const { whatsApps } = useContext(WhatsAppsContext);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    // WhatsApp connection status
    const connectedCount = whatsApps.filter(w => w.status === "CONNECTED").length;
    const totalCount = whatsApps.length;
    const allConnected = connectedCount === totalCount && totalCount > 0;

    // Keyboard shortcut (Ctrl+K / Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearchFocus = () => {
        setSearchOpen(true);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchQuery("");
    };

    const handleQuickAction = (action) => {
        handleSearchClose();
        switch (action) {
            case "new-ticket":
                setNewTicketModalOpen(true);
                break;
            case "new-contact":
                setContactModalOpen(true);
                break;
            case "contacts":
                history.push("/contacts");
                break;
            case "tickets":
                history.push("/tickets");
                break;
            default:
                break;
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div className={classes.toolbar}>
                {/* Left Section - Logo & Status */}
                <div className={classes.leftSection}>
                    <img src={logo} alt="Komu" className={classes.logo} />

                    {!isMobile && (
                        <div className={classes.statusIndicators}>
                            <Tooltip title={`${connectedCount}/${totalCount} conexiones activas`}>
                                <div className={classes.statusChip}>
                                    <FiberManualRecordIcon
                                        className={`${classes.statusDot} ${allConnected ? classes.statusConnected : classes.statusDisconnected}`}
                                    />
                                    <WhatsAppIcon style={{ fontSize: 14 }} />
                                    <span>{connectedCount}/{totalCount}</span>
                                </div>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {/* Center Section - Search */}
                <div className={classes.centerSection}>
                    <ClickAwayListener onClickAway={handleSearchClose}>
                        <div className={classes.searchContainer}>
                            <SearchIcon className={classes.searchIcon} />
                            <InputBase
                                className={classes.searchInput}
                                placeholder={i18n.t("mainDrawer.appBar.search") || "Buscar..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={handleSearchFocus}
                            />
                            {!isMobile && !searchOpen && (
                                <span className={classes.searchShortcut}>⌘K</span>
                            )}

                            {/* Search Results Dropdown */}
                            <Fade in={searchOpen}>
                                <Paper className={classes.searchResults} elevation={0}>
                                    <Typography className={classes.searchCategory}>
                                        Acciones Rápidas
                                    </Typography>
                                    <List dense>
                                        <ListItem
                                            button
                                            className={classes.searchItem}
                                            onClick={() => handleQuickAction("new-ticket")}
                                        >
                                            <ListItemIcon><AddIcon color="primary" /></ListItemIcon>
                                            <ListItemText primary="Nuevo Ticket" secondary="Crear una nueva conversación" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            className={classes.searchItem}
                                            onClick={() => handleQuickAction("new-contact")}
                                        >
                                            <ListItemIcon><PersonAddIcon color="primary" /></ListItemIcon>
                                            <ListItemText primary="Nuevo Contacto" secondary="Agregar un contacto" />
                                        </ListItem>
                                    </List>

                                    <Typography className={classes.searchCategory}>
                                        Navegación
                                    </Typography>
                                    <List dense>
                                        <ListItem
                                            button
                                            className={classes.searchItem}
                                            onClick={() => handleQuickAction("tickets")}
                                        >
                                            <ListItemIcon><ConfirmationNumberIcon /></ListItemIcon>
                                            <ListItemText primary="Ir a Tickets" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            className={classes.searchItem}
                                            onClick={() => handleQuickAction("contacts")}
                                        >
                                            <ListItemIcon><ContactPhoneIcon /></ListItemIcon>
                                            <ListItemText primary="Ir a Contactos" />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Fade>
                        </div>
                    </ClickAwayListener>
                </div>

                {/* Right Section - Actions & Profile */}
                <div className={classes.rightSection}>
                    {!isMobile && (
                        <>
                            <Tooltip title="Nuevo Ticket">
                                <IconButton
                                    className={classes.actionButton}
                                    onClick={() => setNewTicketModalOpen(true)}
                                >
                                    <Badge variant="dot" color="primary" invisible>
                                        <AddIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Nuevo Contacto">
                                <IconButton
                                    className={classes.actionButton}
                                    onClick={() => setContactModalOpen(true)}
                                >
                                    <PersonAddIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    <Tooltip title={user?.name || "Usuario"}>
                        <Avatar className={classes.avatar}>
                            {getInitials(user?.name)}
                        </Avatar>
                    </Tooltip>
                </div>
            </div>

            {/* Modals */}
            <NewTicketModal
                modalOpen={newTicketModalOpen}
                onClose={() => setNewTicketModalOpen(false)}
            />
            <ContactModal
                open={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
            />
        </>
    );
};

export default TopToolbar;
