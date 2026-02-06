import React from "react";

import { Avatar, CardHeader, makeStyles } from "@material-ui/core";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
	header: {
		padding: "6px 8px",
		"& .MuiCardHeader-avatar": {
			marginRight: 10,
		},
		"& .MuiCardHeader-content": {
			overflow: "hidden",
		},
		[theme.breakpoints.down("sm")]: {
			padding: "4px 6px",
		},
	},
	avatar: {
		width: 36,
		height: 36,
		[theme.breakpoints.down("sm")]: {
			width: 32,
			height: 32,
		},
	},
	title: {
		fontSize: 14,
		fontWeight: 500,
		lineHeight: 1.2,
		[theme.breakpoints.down("sm")]: {
			fontSize: 13,
		},
	},
	subheader: {
		fontSize: 12,
		lineHeight: 1.2,
		color: "#666",
		[theme.breakpoints.down("sm")]: {
			fontSize: 11,
		},
	},
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	return (
		<CardHeader
			onClick={onClick}
			className={classes.header}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{
				noWrap: true,
				className: classes.title
			}}
			subheaderTypographyProps={{
				noWrap: true,
				className: classes.subheader
			}}
			avatar={
				<Avatar
					src={contact.profilePicUrl}
					alt="contact_image"
					className={classes.avatar}
				/>
			}
			title={`${contact.name} #${ticket.id}`}
			subheader={
				ticket.user &&
				`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`
			}
		/>
	);
};

export default TicketInfo;
