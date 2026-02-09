import React, { useState, useContext, useEffect, useCallback } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";
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
    Menu,
    MenuItem,
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
import NotificationsPopOver from "../NotificationsPopOver";

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

    const { user, handleLogout } = useContext(AuthContext);
    const { whatsApps } = useContext(WhatsAppsContext);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const userMenuOpen = Boolean(userMenuAnchor);

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
                {/* Logo */}
                <div className={classes.leftSection}>
                    <img src={logo} alt="Komu" className={classes.logo} />
                </div>

                {/* Right section - notifications + user profile */}
                <div className={classes.rightSection}>
                    {user.id && (
                        <NotificationsPopOver />
                    )}
                    <Tooltip title={user.name || "Usuario"}>
                        <Avatar
                            className={classes.avatar}
                            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                        >
                            {getInitials(user.name)}
                        </Avatar>
                    </Tooltip>
                    <Menu
                        id="topbar-user-menu"
                        anchorEl={userMenuAnchor}
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        open={userMenuOpen}
                        onClose={() => setUserMenuAnchor(null)}
                    >
                        <MenuItem
                            component={RouterLink}
                            to="/profile"
                            onClick={() => setUserMenuAnchor(null)}
                        >
                            {i18n.t("mainDrawer.appBar.user.profile")}
                        </MenuItem>
                        <MenuItem onClick={() => { setUserMenuAnchor(null); handleLogout(); }}>
                            {i18n.t("mainDrawer.appBar.user.logout")}
                        </MenuItem>
                    </Menu>
                </div>
            </div>

            {/* Modals - kept for future use */}
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
