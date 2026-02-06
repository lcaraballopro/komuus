import React, { useState, useEffect, useReducer, useContext } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
	ticketsListWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		backgroundColor: theme.palette.background.default,
	},

	ticketsList: {
		flex: 1,
		overflowY: "auto",
		padding: theme.spacing(0.5, 0),
		...theme.scrollbarStyles,
		"&::-webkit-scrollbar": {
			width: 6,
		},
		"&::-webkit-scrollbar-thumb": {
			backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
			borderRadius: 3,
		},
	},

	noTicketsDiv: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing(4),
		textAlign: "center",
	},

	noTicketsIcon: {
		fontSize: 80,
		color: theme.palette.text.secondary,
		opacity: 0.2,
		marginBottom: theme.spacing(2),
	},

	noTicketsTitle: {
		fontSize: "1.25rem",
		fontWeight: 600,
		color: theme.palette.text.primary,
		marginBottom: theme.spacing(1),
	},

	noTicketsText: {
		fontSize: "0.9rem",
		color: theme.palette.text.secondary,
		maxWidth: 280,
		lineHeight: 1.5,
	},
}));

const reducer = (state, action) => {
	if (action.type === "LOAD_TICKETS") {
		const newTickets = action.payload;

		newTickets.forEach(ticket => {
			const ticketIndex = state.findIndex(t => t.id === ticket.id);
			if (ticketIndex !== -1) {
				state[ticketIndex] = ticket;
				if (ticket.unreadMessages > 0) {
					state.unshift(state.splice(ticketIndex, 1)[0]);
				}
			} else {
				state.push(ticket);
			}
		});

		return [...state];
	}

	if (action.type === "RESET_UNREAD") {
		const ticketId = action.payload;

		const ticketIndex = state.findIndex(t => t.id === ticketId);
		if (ticketIndex !== -1) {
			state[ticketIndex].unreadMessages = 0;
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex(t => t.id === ticket.id);
		if (ticketIndex !== -1) {
			state[ticketIndex] = ticket;
		} else {
			state.unshift(ticket);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex(t => t.id === ticket.id);
		if (ticketIndex !== -1) {
			state[ticketIndex] = ticket;
			state.unshift(state.splice(ticketIndex, 1)[0]);
		} else {
			state.unshift(ticket);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_CONTACT") {
		const contact = action.payload;
		const ticketIndex = state.findIndex(t => t.contactId === contact.id);
		if (ticketIndex !== -1) {
			state[ticketIndex].contact = contact;
		}
		return [...state];
	}

	if (action.type === "DELETE_TICKET") {
		const ticketId = action.payload;
		const ticketIndex = state.findIndex(t => t.id === ticketId);
		if (ticketIndex !== -1) {
			state.splice(ticketIndex, 1);
		}

		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const TicketsList = (props) => {
	const { status, searchParam, showAll, selectedQueueIds, updateCount, style } =
		props;
	const classes = useStyles();
	const [pageNumber, setPageNumber] = useState(1);
	const [ticketsList, dispatch] = useReducer(reducer, []);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [status, searchParam, dispatch, showAll, selectedQueueIds]);

	const { tickets, hasMore, loading } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
		queueIds: JSON.stringify(selectedQueueIds),
	});

	useEffect(() => {
		if (!status && !searchParam) return;
		dispatch({
			type: "LOAD_TICKETS",
			payload: tickets,
		});
	}, [tickets]);

	useEffect(() => {
		const socket = openSocket();

		// If user has no specific queues selected, show all tickets
		// Otherwise only show tickets matching the selected queues
		const shouldUpdateTicket = ticket => !searchParam &&
			(!ticket.userId || ticket.userId === user?.id || showAll) &&
			(selectedQueueIds.length === 0 || !ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

		// Only filter by queue if user has specific queues selected
		const notBelongsToUserQueues = ticket =>
			selectedQueueIds.length > 0 && ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

		socket.on("connect", () => {
			if (status) {
				socket.emit("joinTickets", status);
			} else {
				socket.emit("joinNotification");
			}
		});

		socket.on("ticket", data => {
			console.log("🎫 Ticket event received:", data.action, data.ticket?.id, data.ticket?.status, {
				shouldUpdate: data.ticket ? shouldUpdateTicket(data.ticket) : "no ticket",
				currentStatus: status,
				ticketStatus: data.ticket?.status
			});
			if (data.action === "updateUnread") {
				dispatch({
					type: "RESET_UNREAD",
					payload: data.ticketId,
				});
			}

			if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
				// If ticket status doesn't match the current list status, remove it from this list
				if (status && data.ticket.status !== status) {
					console.log("🎫 DELETE_TICKET - status mismatch", status, data.ticket.status);
					dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
				} else {
					console.log("🎫 UPDATE_TICKET - adding/updating", data.ticket.id);
					dispatch({
						type: "UPDATE_TICKET",
						payload: data.ticket,
					});
				}
			}

			if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
				dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
			}
		});

		socket.on("appMessage", data => {
			// Only update if ticket status matches this list's status
			if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
				if (!status || data.ticket.status === status) {
					dispatch({
						type: "UPDATE_TICKET_UNREAD_MESSAGES",
						payload: data.ticket,
					});
				}
			}
		});

		socket.on("contact", data => {
			if (data.action === "update") {
				dispatch({
					type: "UPDATE_TICKET_CONTACT",
					payload: data.contact,
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [status, searchParam, showAll, user, selectedQueueIds]);

	useEffect(() => {
		if (typeof updateCount === "function") {
			updateCount(ticketsList.length);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketsList]);

	const loadMore = () => {
		setPageNumber(prevState => prevState + 1);
	};

	const handleScroll = e => {
		if (!hasMore || loading) return;

		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			e.currentTarget.scrollTop = scrollTop - 100;
			loadMore();
		}
	};

	return (
		<Paper className={classes.ticketsListWrapper} style={style} elevation={0}>
			<div
				className={classes.ticketsList}
				onScroll={handleScroll}
			>
				{ticketsList.length === 0 && !loading ? (
					<div className={classes.noTicketsDiv}>
						<ChatBubbleOutlineIcon className={classes.noTicketsIcon} />
						<Typography className={classes.noTicketsTitle}>
							{i18n.t("ticketsList.noTicketsTitle")}
						</Typography>
						<Typography className={classes.noTicketsText}>
							{i18n.t("ticketsList.noTicketsMessage")}
						</Typography>
					</div>
				) : (
					<>
						{ticketsList.map(ticket => (
							<TicketListItem ticket={ticket} key={ticket.id} />
						))}
					</>
				)}
				{loading && <TicketsListSkeleton />}
			</div>
		</Paper>
	);
};

export default TicketsList;
