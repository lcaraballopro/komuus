import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Tooltip } from "@material-ui/core";
import { MoreVert, Replay, Assignment } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ContactFormFiller from "../ContactFormFiller";
import ResolveTicketModal from "../ResolveTicketModal";

const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: 4,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		display: "flex",
		alignItems: "center",
		gap: 4,
		"& > *": {
			margin: "0 !important",
		},
		[theme.breakpoints.down("sm")]: {
			gap: 2,
			marginRight: 2,
		},
	},
	actionButton: {
		padding: "4px 10px",
		fontSize: 12,
		minWidth: "auto",
		[theme.breakpoints.down("sm")]: {
			padding: "3px 8px",
			fontSize: 11,
		},
	},
	iconButton: {
		padding: 6,
		[theme.breakpoints.down("sm")]: {
			padding: 4,
		},
	},
	formButton: {
		color: theme.palette.primary.main,
		padding: 6,
		[theme.breakpoints.down("sm")]: {
			padding: 4,
		},
	},
}));

const TicketActionButtons = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);
	const [formFillerOpen, setFormFillerOpen] = useState(false);
	const [resolveModalOpen, setResolveModalOpen] = useState(false);

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
			});

			setLoading(false);
			if (status === "open") {
				history.push(`/tickets/${ticket.id}`);
			} else {
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	const handleResolveClick = () => {
		setResolveModalOpen(true);
	};

	const handleResolveSuccess = () => {
		history.push("/tickets");
	};

	return (
		<div className={classes.actionButtons}>
			{ticket.status === "closed" && (
				<ButtonWithSpinner
					loading={loading}
					startIcon={<Replay style={{ fontSize: 16 }} />}
					size="small"
					className={classes.actionButton}
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.reopen")}
				</ButtonWithSpinner>
			)}
			{ticket.status === "open" && (
				<>
					<Tooltip title={i18n.t("contactFormFiller.title")}>
						<IconButton
							size="small"
							className={classes.formButton}
							onClick={() => setFormFillerOpen(true)}
						>
							<Assignment style={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<ButtonWithSpinner
						loading={loading}
						startIcon={<Replay style={{ fontSize: 14 }} />}
						size="small"
						className={classes.actionButton}
						onClick={e => handleUpdateTicketStatus(e, "pending", null)}
					>
						{i18n.t("messagesList.header.buttons.return")}
					</ButtonWithSpinner>
					<ButtonWithSpinner
						loading={loading}
						size="small"
						variant="contained"
						color="primary"
						className={classes.actionButton}
						onClick={handleResolveClick}
					>
						{i18n.t("messagesList.header.buttons.resolve")}
					</ButtonWithSpinner>
					<IconButton
						onClick={handleOpenTicketOptionsMenu}
						className={classes.iconButton}
					>
						<MoreVert style={{ fontSize: 20 }} />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={ticketOptionsMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
					/>
				</>
			)}
			{ticket.status === "pending" && (
				<ButtonWithSpinner
					loading={loading}
					size="small"
					variant="contained"
					color="primary"
					className={classes.actionButton}
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.accept")}
				</ButtonWithSpinner>
			)}
			<ContactFormFiller
				open={formFillerOpen}
				onClose={() => setFormFillerOpen(false)}
				ticketId={ticket.id}
				contactId={ticket.contact?.id}
			/>
			<ResolveTicketModal
				open={resolveModalOpen}
				onClose={() => setResolveModalOpen(false)}
				ticket={ticket}
				onResolve={handleResolveSuccess}
			/>
		</div>
	);
};

export default TicketActionButtons;


