import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
    makeStyles,
    Drawer,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Badge,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";

import TicketListItem from "../TicketListItem";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    drawer: {
        "& .MuiDrawer-paper": {
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            maxHeight: "70vh",
            backgroundColor: theme.palette.type === "dark" ? "#1e1e2d" : "#fff",
        },
    },
    pullHandle: {
        position: "fixed",
        top: 52, // Below the TopToolbar
        left: "50%",
        transform: "translateX(-50%)",
        width: 50,
        height: 5,
        backgroundColor: theme.palette.text.disabled,
        borderRadius: 3,
        zIndex: theme.zIndex.drawer + 5,
        cursor: "grab",
        transition: "all 0.2s ease",
        opacity: 0.5,
        "&:hover": {
            opacity: 1,
            width: 60,
        },
    },
    pullHandleActive: {
        opacity: 1,
        width: 60,
        backgroundColor: theme.palette.primary.main,
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing(2, 2, 1, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    headerTitle: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
    },
    headerIcon: {
        color: theme.palette.primary.main,
    },
    content: {
        overflowY: "auto",
        maxHeight: "calc(70vh - 70px)",
        ...theme.scrollbarStyles,
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing(1),
        opacity: 0.5,
    },
    swipeIndicator: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        transform: "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.1s ease",
        zIndex: theme.zIndex.drawer + 6,
    },
}));

const NotificationDrawer = () => {
    const classes = useStyles();
    const history = useHistory();
    const { user } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const isSwipeGesture = useRef(false);

    const { tickets } = useTickets({ withUnreadMessages: "true" });

    // Swipe down detection
    const handleTouchStart = useCallback((e) => {
        // Only trigger if starting from top area (within 80px from top of content area)
        const touch = e.touches[0];
        // Check if we're near the top of the page (accounting for toolbar height)
        if (touch.clientY < 120 && window.scrollY === 0) {
            touchStartY.current = touch.clientY;
            touchStartTime.current = Date.now();
            isSwipeGesture.current = true;
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isSwipeGesture.current) return;

        const touch = e.touches[0];
        const deltaY = touch.clientY - touchStartY.current;

        if (deltaY > 0 && deltaY < 150) {
            // Show progress indicator
            setSwipeProgress(Math.min(deltaY / 100, 1));
        }
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (!isSwipeGesture.current) return;

        const touch = e.changedTouches[0];
        const deltaY = touch.clientY - touchStartY.current;
        const deltaTime = Date.now() - touchStartTime.current;
        const velocity = deltaY / deltaTime;

        // Open drawer if swiped down far enough or fast enough
        if (deltaY > 80 || (velocity > 0.5 && deltaY > 30)) {
            setOpen(true);
        }

        // Reset
        isSwipeGesture.current = false;
        setSwipeProgress(0);
    }, []);

    // Attach touch listeners to document
    useEffect(() => {
        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: true });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleTicketClick = () => {
        setOpen(false);
    };

    return (
        <>
            {/* Swipe Progress Indicator */}
            <div
                className={classes.swipeIndicator}
                style={{ transform: `scaleX(${swipeProgress})` }}
            />

            {/* Pull Handle (visible on mobile) */}
            <div
                className={`${classes.pullHandle} ${swipeProgress > 0 ? classes.pullHandleActive : ""}`}
                onClick={() => setOpen(true)}
            />

            {/* Notification Drawer */}
            <Drawer
                anchor="top"
                open={open}
                onClose={handleClose}
                className={classes.drawer}
            >
                <div className={classes.header}>
                    <div className={classes.headerTitle}>
                        <Badge badgeContent={tickets.length} color="secondary">
                            <NotificationsActiveIcon className={classes.headerIcon} />
                        </Badge>
                        <Typography variant="h6">
                            {i18n.t("notifications.title") || "Notificaciones"}
                        </Typography>
                    </div>
                    <IconButton size="small" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className={classes.content}>
                    {tickets.length === 0 ? (
                        <div className={classes.emptyState}>
                            <NotificationsActiveIcon className={classes.emptyIcon} />
                            <Typography variant="body2">
                                {i18n.t("notifications.noTickets") || "No hay notificaciones"}
                            </Typography>
                        </div>
                    ) : (
                        <List>
                            {tickets.map((ticket) => (
                                <div key={ticket.id} onClick={handleTicketClick}>
                                    <TicketListItem ticket={ticket} />
                                </div>
                            ))}
                        </List>
                    )}
                </div>
            </Drawer>
        </>
    );
};

export default NotificationDrawer;
