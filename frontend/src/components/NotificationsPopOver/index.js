import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import openSocket from "../../services/socket-io";
import useSound from "use-sound";

import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import ChatIcon from "@material-ui/icons/Chat";

import TicketListItem from "../TicketListItem";
import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePushSubscription from "../../hooks/usePushSubscription";
import { showToastNotification } from "../ToastNotification";

const useStyles = makeStyles(theme => ({
	tabContainer: {
		overflowY: "auto",
		maxHeight: 350,
		...theme.scrollbarStyles,
	},
	popoverPaper: {
		width: "100%",
		maxWidth: 350,
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(1),
		[theme.breakpoints.down("sm")]: {
			maxWidth: 270,
		},
	},
	noShadow: {
		boxShadow: "none !important",
	},
	iconButton: {
		color: theme.palette.text.primary,
	},
}));

const NotificationsPopOver = () => {
	const classes = useStyles();

	const history = useHistory();
	const { user } = useContext(AuthContext);
	const ticketIdUrl = +history.location.pathname.split("/")[2];
	const ticketIdRef = useRef(ticketIdUrl);
	const anchorEl = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);

	const [, setDesktopNotifications] = useState([]);

	const { tickets } = useTickets({ withUnreadMessages: "true" });
	const [play] = useSound(alertSound);
	const soundAlertRef = useRef();

	const historyRef = useRef(history);

	// Web Push subscription hook
	const { isSubscribed, isSupported, subscribe } = usePushSubscription();

	useEffect(() => {
		soundAlertRef.current = play;

		if (!("Notification" in window)) {
			console.log("This browser doesn't support notifications");
		} else {
			Notification.requestPermission().then(permission => {
				// Auto-subscribe to Web Push when permission is granted
				if (permission === "granted" && isSupported && !isSubscribed) {
					subscribe();
				}
			});
		}
	}, [play, isSupported, isSubscribed, subscribe]);

	useEffect(() => {
		// Use a Map to ensure unique tickets by ID and prevent duplicates
		setNotifications(prevState => {
			const ticketMap = new Map();
			// Add existing notifications first
			prevState.forEach(t => ticketMap.set(t.id, t));
			// Override with new tickets from API (they have the latest data)
			(tickets || []).forEach(t => ticketMap.set(t.id, t));
			return Array.from(ticketMap.values());
		});
	}, [tickets]);

	useEffect(() => {
		ticketIdRef.current = ticketIdUrl;
	}, [ticketIdUrl]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("connect", () => socket.emit("joinNotification"));

		socket.on("ticket", data => {
			if (data.action === "updateUnread" || data.action === "delete") {
				setNotifications(prevState => {
					// Use filter for immutable update - removes the ticket
					return prevState.filter(t => t.id !== data.ticketId);
				});

				setDesktopNotifications(prevState => {
					const notificationIndex = prevState.findIndex(
						n => n.tag === String(data.ticketId)
					);
					if (notificationIndex !== -1) {
						prevState[notificationIndex].close();
						return prevState.filter(n => n.tag !== String(data.ticketId));
					}
					return prevState;
				});
			}
		});

		socket.on("appMessage", data => {
			if (
				data.action === "create" &&
				!data.message.read &&
				(data.ticket.userId === user?.id || !data.ticket.userId)
			) {
				setNotifications(prevState => {
					// Check if ticket already exists to prevent duplicates
					const existingIndex = prevState.findIndex(t => t.id === data.ticket.id);
					if (existingIndex !== -1) {
						// Update existing ticket with new data using immutable approach
						const newState = [...prevState];
						newState[existingIndex] = data.ticket;
						return newState;
					}
					// Add new ticket at the beginning
					return [data.ticket, ...prevState];
				});

				const shouldNotNotificate =
					(data.message.ticketId === ticketIdRef.current &&
						document.visibilityState === "visible") ||
					(data.ticket.userId && data.ticket.userId !== user?.id) ||
					data.ticket.isGroup;

				if (shouldNotNotificate) return;

				handleNotifications(data);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

	const handleNotifications = data => {
		const { message, contact, ticket } = data;

		// Show in-app toast notification (Windows-style)
		showToastNotification({ message, contact, ticket });

		const options = {
			body: `${message.body} - ${format(new Date(), "HH:mm")}`,
			icon: contact.profilePicUrl,
			tag: String(ticket.id),
			renotify: true,
		};

		const title = `${i18n.t("tickets.notification.message")} ${contact.name}`;

		// Use Service Worker for notifications (works in background on PWA)
		if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
			navigator.serviceWorker.ready.then(registration => {
				registration.showNotification(title, options);
			});
		} else {
			// Fallback for browsers without SW support
			const notification = new Notification(title, options);
			notification.onclick = e => {
				e.preventDefault();
				window.focus();
				historyRef.current.push(`/tickets/${ticket.id}`);
			};
		}

		// Note: Sound is now played by ToastNotificationContainer
	};

	const handleClick = () => {
		setIsOpen(prevState => !prevState);
	};

	const handleClickAway = () => {
		setIsOpen(false);
	};

	const NotificationTicket = ({ children }) => {
		return <div onClick={handleClickAway}>{children}</div>;
	};

	return (
		<>
			<IconButton
				onClick={handleClick}
				ref={anchorEl}
				aria-label="Open Notifications"
				className={classes.iconButton}
			>
				<Badge badgeContent={notifications.length} color="secondary">
					<ChatIcon />
				</Badge>
			</IconButton>
			<Popover
				disableScrollLock
				open={isOpen}
				anchorEl={anchorEl.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				classes={{ paper: classes.popoverPaper }}
				onClose={handleClickAway}
			>
				<List dense className={classes.tabContainer}>
					{notifications.length === 0 ? (
						<ListItem>
							<ListItemText>{i18n.t("notifications.noTickets")}</ListItemText>
						</ListItem>
					) : (
						notifications.map(ticket => (
							<NotificationTicket key={ticket.id}>
								<TicketListItem ticket={ticket} />
							</NotificationTicket>
						))
					)}
				</List>
			</Popover>
		</>
	);
};

export default NotificationsPopOver;
