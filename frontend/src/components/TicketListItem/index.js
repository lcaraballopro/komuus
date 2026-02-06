import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	conversationItem: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(1.5, 2),
		margin: theme.spacing(0.5, 1),
		borderRadius: 16,
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		backgroundColor: "transparent",
		position: "relative",
		"&:hover": {
			backgroundColor: theme.palette.type === "dark"
				? "rgba(255, 255, 255, 0.06)"
				: "rgba(0, 0, 0, 0.04)",
			transform: "translateX(4px)",
		},
	},

	conversationItemSelected: {
		backgroundColor: theme.palette.type === "dark"
			? "rgba(37, 211, 102, 0.15)"
			: "rgba(37, 211, 102, 0.1)",
		borderLeft: `3px solid ${green[500]}`,
		"&:hover": {
			backgroundColor: theme.palette.type === "dark"
				? "rgba(37, 211, 102, 0.2)"
				: "rgba(37, 211, 102, 0.15)",
		},
	},

	pendingItem: {
		cursor: "default",
		opacity: 0.9,
		"&:hover": {
			transform: "none",
		},
	},

	avatarContainer: {
		position: "relative",
		marginRight: theme.spacing(1.5),
	},

	avatar: {
		width: 52,
		height: 52,
		fontSize: "1.2rem",
		fontWeight: 600,
		border: `3px solid ${theme.palette.type === "dark" ? "#2d2d3d" : "#f0f0f0"}`,
		boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
	},

	avatarWithQueue: {
		border: "3px solid",
	},

	onlineIndicator: {
		position: "absolute",
		bottom: 2,
		right: 2,
		width: 14,
		height: 14,
		borderRadius: "50%",
		backgroundColor: green[500],
		border: `2px solid ${theme.palette.background.paper}`,
	},

	contentWrapper: {
		flex: 1,
		minWidth: 0,
		display: "flex",
		flexDirection: "column",
		gap: 2,
	},

	headerRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: theme.spacing(1),
	},

	contactName: {
		fontWeight: 600,
		fontSize: "0.95rem",
		color: theme.palette.text.primary,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		flex: 1,
	},

	timestamp: {
		fontSize: "0.75rem",
		color: theme.palette.text.secondary,
		flexShrink: 0,
		fontWeight: 400,
	},

	timestampUnread: {
		color: green[500],
		fontWeight: 600,
	},

	messageRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: theme.spacing(1),
	},

	lastMessage: {
		fontSize: "0.875rem",
		color: theme.palette.text.secondary,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		flex: 1,
		lineHeight: 1.4,
		"& p": {
			margin: 0,
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap",
		},
	},

	lastMessageUnread: {
		color: theme.palette.text.primary,
		fontWeight: 500,
	},

	unreadBadge: {
		minWidth: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: green[500],
		color: "#fff",
		fontSize: "0.75rem",
		fontWeight: 700,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: "0 6px",
		flexShrink: 0,
		boxShadow: "0 2px 4px rgba(37, 211, 102, 0.3)",
	},

	closedBadge: {
		fontSize: "0.65rem",
		padding: "2px 8px",
		borderRadius: 10,
		backgroundColor: theme.palette.type === "dark" ? grey[700] : grey[300],
		color: theme.palette.type === "dark" ? grey[300] : grey[700],
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.5px",
	},

	connectionBadge: {
		position: "absolute",
		top: -4,
		right: -4,
		padding: "2px 6px",
		borderRadius: 8,
		backgroundColor: theme.palette.primary.main,
		color: "#fff",
		fontSize: "0.6rem",
		fontWeight: 600,
		maxWidth: 60,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
	},

	acceptButton: {
		marginLeft: "auto",
		borderRadius: 20,
		padding: theme.spacing(0.75, 2),
		textTransform: "none",
		fontWeight: 600,
		fontSize: "0.85rem",
		boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
		backgroundColor: green[500],
		color: "#fff",
		"&:hover": {
			backgroundColor: green[600],
		},
	},

	queueIndicator: {
		position: "absolute",
		left: 0,
		top: "50%",
		transform: "translateY(-50%)",
		width: 4,
		height: "60%",
		borderRadius: "0 4px 4px 0",
	},
}));

const TicketListItem = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	const isSelected = ticketId && +ticketId === ticket.id;
	const hasUnread = ticket.unreadMessages > 0;

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleAcceptTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
	};

	const handleSelectTicket = id => {
		history.push(`/tickets/${id}`);
	};

	const formatTime = (date) => {
		if (isSameDay(parseISO(date), new Date())) {
			return format(parseISO(date), "HH:mm");
		}
		return format(parseISO(date), "dd/MM");
	};

	return (
		<div
			className={clsx(classes.conversationItem, {
				[classes.conversationItemSelected]: isSelected,
				[classes.pendingItem]: ticket.status === "pending",
			})}
			onClick={() => {
				if (ticket.status === "pending") return;
				handleSelectTicket(ticket.id);
			}}
		>
			{/* Queue color indicator */}
			{ticket.queue?.color && (
				<Tooltip title={ticket.queue?.name || ""} placement="left" arrow>
					<span
						className={classes.queueIndicator}
						style={{ backgroundColor: ticket.queue?.color }}
					/>
				</Tooltip>
			)}

			{/* Avatar section */}
			<div className={classes.avatarContainer}>
				<Avatar
					src={ticket?.contact?.profilePicUrl}
					className={clsx(classes.avatar, {
						[classes.avatarWithQueue]: ticket.queue?.color,
					})}
					style={ticket.queue?.color ? { borderColor: ticket.queue.color } : {}}
				>
					{ticket.contact?.name?.charAt(0).toUpperCase()}
				</Avatar>
				{ticket.whatsappId && (
					<Tooltip title={i18n.t("ticketsList.connectionTitle")} arrow>
						<span className={classes.connectionBadge}>
							{ticket.whatsapp?.name}
						</span>
					</Tooltip>
				)}
			</div>

			{/* Content section */}
			<div className={classes.contentWrapper}>
				<div className={classes.headerRow}>
					<Typography className={classes.contactName}>
						{ticket.contact.name}
					</Typography>

					{ticket.status === "closed" && (
						<span className={classes.closedBadge}>Archivada</span>
					)}

					{ticket.lastMessage && (
						<Typography
							className={clsx(classes.timestamp, {
								[classes.timestampUnread]: hasUnread,
							})}
						>
							{formatTime(ticket.updatedAt)}
						</Typography>
					)}
				</div>

				<div className={classes.messageRow}>
					<Typography
						className={clsx(classes.lastMessage, {
							[classes.lastMessageUnread]: hasUnread,
						})}
						component="div"
					>
						{ticket.lastMessage ? (
							<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
						) : (
							<span style={{ fontStyle: "italic", opacity: 0.6 }}>
								Sin mensajes
							</span>
						)}
					</Typography>

					{hasUnread && (
						<span className={classes.unreadBadge}>
							{ticket.unreadMessages > 99 ? "99+" : ticket.unreadMessages}
						</span>
					)}

					{ticket.status === "pending" && (
						<ButtonWithSpinner
							color="primary"
							variant="contained"
							className={classes.acceptButton}
							size="small"
							loading={loading}
							onClick={e => {
								e.stopPropagation();
								handleAcceptTicket(ticket.id);
							}}
						>
							{i18n.t("ticketsList.buttons.accept")}
						</ButtonWithSpinner>
					)}
				</div>
			</div>
		</div>
	);
};

export default TicketListItem;
