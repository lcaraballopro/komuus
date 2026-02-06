import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { format } from "date-fns";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import useSound from "use-sound";
import alertSound from "../../assets/sound.mp3";

const useStyles = makeStyles((theme) => ({
    container: {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 380,
        [theme.breakpoints.down("xs")]: {
            right: 12,
            bottom: 12,
            left: 12,
            maxWidth: "none",
        },
    },
    toast: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: theme.palette.type === "dark"
            ? "rgba(40, 40, 45, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        boxShadow: theme.palette.type === "dark"
            ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)",
        border: theme.palette.type === "dark"
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.08)",
        animation: "$slideIn 0.3s ease-out",
        gap: 12,
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
            transform: "translateX(-4px)",
            boxShadow: theme.palette.type === "dark"
                ? "0 12px 40px rgba(0, 0, 0, 0.5)"
                : "0 12px 40px rgba(0, 0, 0, 0.2)",
        },
    },
    toastExiting: {
        animation: "$slideOut 0.3s ease-in forwards",
    },
    "@keyframes slideIn": {
        "0%": {
            opacity: 0,
            transform: "translateX(100%)",
        },
        "100%": {
            opacity: 1,
            transform: "translateX(0)",
        },
    },
    "@keyframes slideOut": {
        "0%": {
            opacity: 1,
            transform: "translateX(0)",
        },
        "100%": {
            opacity: 0,
            transform: "translateX(100%)",
        },
    },
    avatarWrapper: {
        position: "relative",
    },
    avatar: {
        width: 48,
        height: 48,
        border: `2px solid ${theme.palette.primary.main}`,
    },
    logoOverlay: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        backgroundColor: "#25D366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${theme.palette.type === "dark" ? "#28282d" : "#fff"}`,
        fontSize: 10,
        fontWeight: 700,
        color: "#fff",
    },
    content: {
        flex: 1,
        minWidth: 0,
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    name: {
        fontWeight: 600,
        fontSize: "0.95rem",
        color: theme.palette.text.primary,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    time: {
        fontSize: "0.75rem",
        color: theme.palette.text.secondary,
        marginLeft: 8,
        flexShrink: 0,
    },
    message: {
        fontSize: "0.875rem",
        color: theme.palette.text.secondary,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginLeft: 8,
    },
    badge: {
        "& .MuiBadge-badge": {
            backgroundColor: "#25D366",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.75rem",
            minWidth: 22,
            height: 22,
            borderRadius: 11,
        },
    },
    acceptButton: {
        backgroundColor: "#25D366",
        color: "#fff",
        textTransform: "none",
        fontWeight: 600,
        padding: "6px 16px",
        borderRadius: 20,
        fontSize: "0.85rem",
        "&:hover": {
            backgroundColor: "#1ebe5a",
        },
    },
    closeButton: {
        position: "absolute",
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: theme.palette.type === "dark"
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(0, 0, 0, 0.1)",
        color: theme.palette.text.secondary,
        "&:hover": {
            backgroundColor: theme.palette.type === "dark"
                ? "rgba(255, 255, 255, 0.25)"
                : "rgba(0, 0, 0, 0.15)",
        },
        "& svg": {
            fontSize: 14,
        },
    },
    toastWrapper: {
        position: "relative",
    },
}));

const ToastNotificationContainer = () => {
    const classes = useStyles();
    const history = useHistory();
    const [toasts, setToasts] = useState([]);
    const [play] = useSound(alertSound);
    const [exitingIds, setExitingIds] = useState([]);

    // Listen for custom toast events
    useEffect(() => {
        const handleToast = (event) => {
            const { ticket, message, contact } = event.detail;

            // Play sound
            play();

            // Add toast (max 3 visible)
            setToasts((prev) => {
                const newToast = {
                    id: Date.now(),
                    ticket,
                    message,
                    contact,
                    createdAt: new Date(),
                };
                const updated = [newToast, ...prev].slice(0, 3);
                return updated;
            });
        };

        window.addEventListener("showToastNotification", handleToast);
        return () => window.removeEventListener("showToastNotification", handleToast);
    }, [play]);

    const removeToast = (id) => {
        setExitingIds((prev) => [...prev, id]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
            setExitingIds((prev) => prev.filter((i) => i !== id));
        }, 300);
    };

    const handleAccept = (toast) => {
        removeToast(toast.id);
        history.push(`/tickets/${toast.ticket.id}`);
    };

    const handleToastClick = (toast, e) => {
        // Don't trigger if clicking the accept button or close button
        if (e.target.closest("button")) return;
        handleAccept(toast);
    };

    // Auto-dismiss after 8 seconds
    useEffect(() => {
        const timers = toasts.map((toast) => {
            return setTimeout(() => {
                removeToast(toast.id);
            }, 8000);
        });

        return () => timers.forEach((t) => clearTimeout(t));
    }, [toasts]);

    if (toasts.length === 0) return null;

    return (
        <div className={classes.container}>
            {toasts.map((toast) => (
                <div key={toast.id} className={classes.toastWrapper}>
                    <div
                        className={`${classes.toast} ${exitingIds.includes(toast.id) ? classes.toastExiting : ""
                            }`}
                        onClick={(e) => handleToastClick(toast, e)}
                    >
                        <div className={classes.avatarWrapper}>
                            <Avatar
                                src={toast.contact?.profilePicUrl}
                                className={classes.avatar}
                            >
                                {toast.contact?.name?.[0]?.toUpperCase() || "?"}
                            </Avatar>
                            <div className={classes.logoOverlay}>K</div>
                        </div>

                        <div className={classes.content}>
                            <div className={classes.header}>
                                <Typography className={classes.name}>
                                    {toast.contact?.name || "Nuevo mensaje"}
                                </Typography>
                                <Typography className={classes.time}>
                                    {format(toast.createdAt, "HH:mm")}
                                </Typography>
                            </div>
                            <Typography className={classes.message}>
                                {toast.message?.body || ""}
                            </Typography>
                        </div>

                        <div className={classes.actions}>
                            <Badge
                                badgeContent={toast.ticket?.unreadMessages || 1}
                                className={classes.badge}
                            >
                                <span />
                            </Badge>
                            <Button
                                className={classes.acceptButton}
                                onClick={() => handleAccept(toast)}
                            >
                                Aceptar
                            </Button>
                        </div>
                    </div>
                    <IconButton
                        size="small"
                        className={classes.closeButton}
                        onClick={() => removeToast(toast.id)}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            ))}
        </div>
    );
};

// Helper function to trigger toast notifications from anywhere
export const showToastNotification = (data) => {
    const event = new CustomEvent("showToastNotification", { detail: data });
    window.dispatchEvent(event);
};

export default ToastNotificationContainer;
