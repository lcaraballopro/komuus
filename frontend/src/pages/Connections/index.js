import React, { useState, useCallback, useContext, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
	Tabs,
	Tab,
	Box,
	Chip,
} from "@material-ui/core";
import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	DeleteOutline,
	Settings,
	Add as AddIcon,
	Code as CodeIcon,
	FileCopy as CopyIcon,
	Delete as DeleteIcon,
} from "@material-ui/icons";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";
import ForumIcon from "@material-ui/icons/Forum";
import PhoneIcon from "@material-ui/icons/Phone";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import ConnectionConfigModal from "../../components/ConnectionConfigModal";
import WebchatChannelModal from "../../components/WebchatChannelModal";
import TelephonyChannelModal from "../../components/TelephonyChannelModal";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
	},
	tabsContainer: {
		borderBottom: `1px solid ${theme.palette.divider}`,
		marginBottom: theme.spacing(2),
	},
	tab: {
		minWidth: 100,
		textTransform: "none",
		fontWeight: 600,
		fontSize: 13,
	},
	tabPanel: {
		width: "100%",
	},
	comingSoon: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing(8, 2),
		textAlign: "center",
	},
	comingSoonIcon: {
		fontSize: 64,
		color: theme.palette.text.disabled,
		marginBottom: theme.spacing(2),
	},
	colorPreview: {
		width: 24,
		height: 24,
		borderRadius: 4,
		marginRight: 8,
		border: "1px solid #ddd",
	},
	scriptDialog: {
		marginTop: theme.spacing(2),
		padding: theme.spacing(2),
		backgroundColor: "#1e1e1e",
		borderRadius: theme.shape.borderRadius,
		fontFamily: "monospace",
		fontSize: 12,
		color: "#d4d4d4",
		whiteSpace: "pre-wrap",
		wordBreak: "break-all",
		maxHeight: 200,
		overflow: "auto",
	},
}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

// Webchat channels reducer
const webchatReducer = (state, action) => {
	if (action.type === "LOAD_CHANNELS") {
		return [...action.payload];
	}
	if (action.type === "UPDATE_CHANNEL") {
		const channelIndex = state.findIndex((c) => c.id === action.payload.id);
		if (channelIndex !== -1) {
			state[channelIndex] = action.payload;
			return [...state];
		}
		return [action.payload, ...state];
	}
	if (action.type === "DELETE_CHANNEL") {
		return state.filter((c) => c.id !== action.payload);
	}
	return state;
};

// Tab panel helper
function TabPanel({ children, value, index, ...other }) {
	return (
		<div role="tabpanel" hidden={value !== index} {...other}>
			{value === index && <Box>{children}</Box>}
		</div>
	);
}

// Coming soon placeholder
const ComingSoonTab = ({ icon: Icon, channelName }) => {
	const classes = useStyles();
	return (
		<div className={classes.comingSoon}>
			<Icon className={classes.comingSoonIcon} />
			<Typography variant="h6" color="textSecondary" gutterBottom>
				{channelName}
			</Typography>
			<Typography variant="body1" color="textSecondary">
				{i18n.t("connections.comingSoon")}
			</Typography>
			<Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
				{i18n.t("connections.comingSoonDesc")}
			</Typography>
		</div>
	);
};

const Connections = () => {
	const classes = useStyles();

	// Active tab
	const [activeTab, setActiveTab] = useState(0);

	// ─── WhatsApp state ───
	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);
	const [configModalOpen, setConfigModalOpen] = useState(false);
	const [configWhatsApp, setConfigWhatsApp] = useState(null);

	// ─── Webchat state ───
	const [webchatChannels, dispatchWebchat] = useReducer(webchatReducer, []);
	const [webchatLoading, setWebchatLoading] = useState(false);
	const [webchatModalOpen, setWebchatModalOpen] = useState(false);
	const [selectedWebchatChannel, setSelectedWebchatChannel] = useState(null);
	const [webchatConfirmOpen, setWebchatConfirmOpen] = useState(false);
	const [scriptModalOpen, setScriptModalOpen] = useState(false);
	const [embedCode, setEmbedCode] = useState("");

	// ─── Telephony state ───
	const [telephonyChannels, setTelephonyChannels] = useState([]);
	const [telephonyLoading, setTelephonyLoading] = useState(false);
	const [telephonyModalOpen, setTelephonyModalOpen] = useState(false);
	const [selectedTelephonyChannel, setSelectedTelephonyChannel] = useState(null);
	const [telephonyConfirmOpen, setTelephonyConfirmOpen] = useState(false);

	// ─── Webchat data loading ───
	const fetchWebchatChannels = useCallback(async () => {
		setWebchatLoading(true);
		try {
			const { data } = await api.get("/webchat-channels");
			dispatchWebchat({ type: "LOAD_CHANNELS", payload: data });
		} catch (err) {
			toastError(err);
		}
		setWebchatLoading(false);
	}, []);

	// ─── Telephony data loading ───
	const fetchTelephonyChannels = useCallback(async () => {
		setTelephonyLoading(true);
		try {
			const { data } = await api.get("/telephony");
			setTelephonyChannels(data);
		} catch (err) {
			toastError(err);
		}
		setTelephonyLoading(false);
	}, []);

	useEffect(() => {
		if (activeTab === 1) {
			fetchWebchatChannels();
		}
		if (activeTab === 2) {
			fetchTelephonyChannels();
		}
	}, [activeTab, fetchWebchatChannels]);

	// ─── WhatsApp handlers ───
	const handleStartWhatsAppSession = async whatsAppId => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async whatsAppId => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

	const handleOpenQrModal = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleOpenConfigModal = (whatsApp) => {
		setConfigWhatsApp(whatsApp);
		setConfigModalOpen(true);
	};

	const handleCloseConfigModal = () => {
		setConfigWhatsApp(null);
		setConfigModalOpen(false);
	};

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	// ─── Webchat handlers ───
	const handleOpenWebchatModal = () => {
		setSelectedWebchatChannel(null);
		setWebchatModalOpen(true);
	};

	const handleEditWebchatChannel = (channel) => {
		setSelectedWebchatChannel(channel);
		setWebchatModalOpen(true);
	};

	const handleCloseWebchatModal = () => {
		setSelectedWebchatChannel(null);
		setWebchatModalOpen(false);
		fetchWebchatChannels();
	};

	const handleDeleteWebchatChannel = (channel) => {
		setSelectedWebchatChannel(channel);
		setWebchatConfirmOpen(true);
	};

	const handleConfirmDeleteWebchat = async () => {
		try {
			await api.delete(`/webchat-channels/${selectedWebchatChannel.id}`);
			dispatchWebchat({ type: "DELETE_CHANNEL", payload: selectedWebchatChannel.id });
			toast.success(i18n.t("webchatChannels.toasts.deleted"));
		} catch (err) {
			toastError(err);
		}
		setWebchatConfirmOpen(false);
		setSelectedWebchatChannel(null);
	};

	const handleGetScript = async (channel) => {
		try {
			const { data } = await api.get(`/webchat-channels/${channel.id}/script`);
			setEmbedCode(data.embedCode);
			setScriptModalOpen(true);
		} catch (err) {
			toastError(err);
		}
	};

	const handleCopyScript = () => {
		navigator.clipboard.writeText(embedCode);
		toast.success(i18n.t("webchatChannels.toasts.scriptCopied"));
		setScriptModalOpen(false);
	};

	// ─── Telephony handlers ───
	const handleOpenTelephonyModal = () => {
		setSelectedTelephonyChannel(null);
		setTelephonyModalOpen(true);
	};

	const handleEditTelephonyChannel = (channel) => {
		setSelectedTelephonyChannel(channel);
		setTelephonyModalOpen(true);
	};

	const handleCloseTelephonyModal = () => {
		setSelectedTelephonyChannel(null);
		setTelephonyModalOpen(false);
		fetchTelephonyChannels();
	};

	const handleDeleteTelephonyChannel = (channel) => {
		setSelectedTelephonyChannel(channel);
		setTelephonyConfirmOpen(true);
	};

	const handleConfirmDeleteTelephony = async () => {
		try {
			await api.delete(`/telephony/${selectedTelephonyChannel.id}`);
			toast.success(i18n.t("telephony.toasts.deleted"));
			fetchTelephonyChannels();
		} catch (err) {
			toastError(err);
		}
		setTelephonyConfirmOpen(false);
		setSelectedTelephonyChannel(null);
	};

	// ─── WhatsApp renderers ───
	const renderActionButtons = whatsApp => {
		return (
			<>
				{whatsApp.status === "qrcode" && (
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={() => handleOpenQrModal(whatsApp)}
					>
						{i18n.t("connections.buttons.qrcode")}
					</Button>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Button
							size="small"
							variant="outlined"
							color="primary"
							onClick={() => handleStartWhatsAppSession(whatsApp.id)}
						>
							{i18n.t("connections.buttons.tryAgain")}
						</Button>{" "}
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => {
								handleOpenConfirmationModal("disconnect", whatsApp.id);
							}}
						>
							{i18n.t("connections.buttons.disconnect")}
						</Button>
					)}
				{whatsApp.status === "OPENING" && (
					<Button size="small" variant="outlined" disabled color="default">
						{i18n.t("connections.buttons.connecting")}
					</Button>
				)}
			</>
		);
	};

	const renderStatusToolTips = whatsApp => {
		return (
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} className={classes.buttonProgress} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar style={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</div>
		);
	};

	// ─── Dynamic add button ───
	const renderAddButton = () => {
		if (activeTab === 0) {
			return (
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpenWhatsAppModal}
				>
					{i18n.t("connections.buttons.addWhatsApp")}
				</Button>
			);
		}
		if (activeTab === 1) {
			return (
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpenWebchatModal}
				>
					<AddIcon style={{ marginRight: 8 }} />
					{i18n.t("connections.buttons.addWebchat")}
				</Button>
			);
		}
		if (activeTab === 2) {
			return (
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpenTelephonyModal}
				>
					<AddIcon style={{ marginRight: 8 }} />
					{i18n.t("connections.buttons.addTelephony")}
				</Button>
			);
		}
		return null;
	};

	// Tab configs
	const tabConfig = [
		{ label: i18n.t("connections.tabs.whatsapp"), icon: <WhatsAppIcon style={{ fontSize: 18 }} /> },
		{ label: i18n.t("connections.tabs.webchat"), icon: <ChatBubbleOutlineIcon style={{ fontSize: 18 }} /> },
		{ label: i18n.t("connections.tabs.telephony"), icon: <PhoneIcon style={{ fontSize: 18 }} /> },
		{ label: i18n.t("connections.tabs.instagram"), icon: <InstagramIcon style={{ fontSize: 18 }} /> },
		{ label: i18n.t("connections.tabs.facebook"), icon: <FacebookIcon style={{ fontSize: 18 }} /> },
		{ label: i18n.t("connections.tabs.messenger"), icon: <ForumIcon style={{ fontSize: 18 }} /> },
	];

	return (
		<MainContainer>
			{/* ─── WhatsApp modals ─── */}
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>
			<ConnectionConfigModal
				open={configModalOpen}
				onClose={handleCloseConfigModal}
				whatsapp={configWhatsApp}
			/>

			{/* ─── Webchat modals ─── */}
			<ConfirmationModal
				title={i18n.t("webchatChannels.confirmDeleteTitle")}
				open={webchatConfirmOpen}
				onClose={() => setWebchatConfirmOpen(false)}
				onConfirm={handleConfirmDeleteWebchat}
			>
				{i18n.t("webchatChannels.confirmDelete")}
			</ConfirmationModal>
			<WebchatChannelModal
				open={webchatModalOpen}
				onClose={handleCloseWebchatModal}
				channelId={selectedWebchatChannel?.id}
			/>

			{/* ─── Telephony modals ─── */}
			<ConfirmationModal
				title={i18n.t("telephony.confirmDeleteTitle")}
				open={telephonyConfirmOpen}
				onClose={() => setTelephonyConfirmOpen(false)}
				onConfirm={handleConfirmDeleteTelephony}
			>
				{i18n.t("telephony.confirmDeleteMessage")}
			</ConfirmationModal>
			<TelephonyChannelModal
				open={telephonyModalOpen}
				onClose={handleCloseTelephonyModal}
				channelId={selectedTelephonyChannel?.id}
			/>

			{/* Script embed modal */}
			{scriptModalOpen && (
				<div style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0,0,0,0.5)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 9999
				}}>
					<Paper style={{ padding: 24, maxWidth: 600, width: "90%" }}>
						<Typography variant="h6" gutterBottom>
							{i18n.t("webchatChannels.embedCode.title")}
						</Typography>
						<Typography variant="body2" color="textSecondary" gutterBottom>
							{i18n.t("webchatChannels.embedCode.description")}
						</Typography>
						<div className={classes.scriptDialog}>
							{embedCode}
						</div>
						<div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
							<Button onClick={() => setScriptModalOpen(false)}>{i18n.t("webchatChannels.embedCode.cancel")}</Button>
							<Button
								variant="contained"
								color="primary"
								startIcon={<CopyIcon />}
								onClick={handleCopyScript}
							>
								{i18n.t("webchatChannels.embedCode.copy")}
							</Button>
						</div>
					</Paper>
				</div>
			)}

			{/* ─── Header ─── */}
			<MainHeader>
				<Title>{i18n.t("connections.title")}</Title>
				<MainHeaderButtonsWrapper>
					{renderAddButton()}
				</MainHeaderButtonsWrapper>
			</MainHeader>

			{/* ─── Tabs ─── */}
			<div className={classes.tabsContainer}>
				<Tabs
					value={activeTab}
					onChange={(_, newVal) => setActiveTab(newVal)}
					indicatorColor="primary"
					textColor="primary"
					variant="scrollable"
					scrollButtons="auto"
				>
					{tabConfig.map((tab, idx) => (
						<Tab
							key={idx}
							className={classes.tab}
							label={
								<Box display="flex" alignItems="center" gridGap={6}>
									{tab.icon}
									<span>{tab.label}</span>
								</Box>
							}
						/>
					))}
				</Tabs>
			</div>

			{/* ─── Tab 0: WhatsApp ─── */}
			<TabPanel value={activeTab} index={0} className={classes.tabPanel}>
				<Paper className={classes.mainPaper} variant="outlined">
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell align="center">
									{i18n.t("connections.table.name")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.status")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.session")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.lastUpdate")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.default")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.actions")}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRowSkeleton />
							) : (
								<>
									{whatsApps?.length > 0 &&
										whatsApps.map(whatsApp => (
											<TableRow key={whatsApp.id}>
												<TableCell align="center">{whatsApp.name}</TableCell>
												<TableCell align="center">
													{renderStatusToolTips(whatsApp)}
												</TableCell>
												<TableCell align="center">
													{renderActionButtons(whatsApp)}
												</TableCell>
												<TableCell align="center">
													{whatsApp.updatedAt
														? (() => { try { return format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm"); } catch (e) { return "-"; } })()
														: "-"}
												</TableCell>
												<TableCell align="center">
													{whatsApp.isDefault && (
														<div className={classes.customTableCell}>
															<CheckCircle style={{ color: green[500] }} />
														</div>
													)}
												</TableCell>
												<TableCell align="center">
													<IconButton
														size="small"
														onClick={() => handleOpenConfigModal(whatsApp)}
														title={i18n.t("connections.buttons.config")}
													>
														<Settings />
													</IconButton>
													<IconButton
														size="small"
														onClick={() => handleEditWhatsApp(whatsApp)}
													>
														<Edit />
													</IconButton>

													<IconButton
														size="small"
														onClick={e => {
															handleOpenConfirmationModal("delete", whatsApp.id);
														}}
													>
														<DeleteOutline />
													</IconButton>
												</TableCell>
											</TableRow>
										))}
								</>
							)}
						</TableBody>
					</Table>
				</Paper>
			</TabPanel>

			{/* ─── Tab 1: Webchat ─── */}
			<TabPanel value={activeTab} index={1} className={classes.tabPanel}>
				<Paper className={classes.mainPaper} variant="outlined">
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>{i18n.t("webchatChannels.table.name")}</TableCell>
								<TableCell align="center">{i18n.t("webchatChannels.table.color")}</TableCell>
								<TableCell align="center">{i18n.t("webchatChannels.table.status")}</TableCell>
								<TableCell align="center">{i18n.t("webchatChannels.table.actions")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{webchatLoading ? (
								<TableRowSkeleton />
							) : webchatChannels.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} align="center">
										<Typography color="textSecondary">
											{i18n.t("webchatChannels.noChannels")}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								webchatChannels.map((channel) => (
									<TableRow key={channel.id}>
										<TableCell>{channel.name}</TableCell>
										<TableCell align="center">
											<div className={classes.customTableCell}>
												<div
													className={classes.colorPreview}
													style={{ backgroundColor: channel.primaryColor }}
												/>
												{channel.primaryColor}
											</div>
										</TableCell>
										<TableCell align="center">
											<Chip
												label={channel.isActive ? i18n.t("webchatChannels.status.active") : i18n.t("webchatChannels.status.inactive")}
												color={channel.isActive ? "primary" : "default"}
												size="small"
											/>
										</TableCell>
										<TableCell align="center">
											<Tooltip title={i18n.t("webchatChannels.tooltips.getCode")}>
												<IconButton
													size="small"
													onClick={() => handleGetScript(channel)}
												>
													<CodeIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title={i18n.t("webchatChannels.tooltips.edit")}>
												<IconButton
													size="small"
													onClick={() => handleEditWebchatChannel(channel)}
												>
													<Edit />
												</IconButton>
											</Tooltip>
											<Tooltip title={i18n.t("webchatChannels.tooltips.delete")}>
												<IconButton
													size="small"
													onClick={() => handleDeleteWebchatChannel(channel)}
												>
													<DeleteIcon />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</Paper>
			</TabPanel>

			{/* ─── Tab 2: Telephony ─── */}
			<TabPanel value={activeTab} index={2} className={classes.tabPanel}>
				<Paper className={classes.mainPaper} variant="outlined">
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>{i18n.t("telephony.table.name")}</TableCell>
								<TableCell align="center">{i18n.t("telephony.table.trunk")}</TableCell>
								<TableCell align="center">{i18n.t("telephony.table.domain")}</TableCell>
								<TableCell align="center">{i18n.t("telephony.table.queue")}</TableCell>
								<TableCell align="center">{i18n.t("telephony.table.actions")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{telephonyLoading ? (
								<TableRowSkeleton />
							) : telephonyChannels.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center">
										<Typography color="textSecondary">
											{i18n.t("telephony.noChannels")}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								telephonyChannels.map((channel) => (
									<TableRow key={channel.id}>
										<TableCell>{channel.name}</TableCell>
										<TableCell align="center">{channel.trunkUsername}</TableCell>
										<TableCell align="center">{channel.trunkDomain}</TableCell>
										<TableCell align="center">{channel.queue?.name || "-"}</TableCell>
										<TableCell align="center">
											<Tooltip title={i18n.t("telephony.modal.titleEdit")}>
												<IconButton
													size="small"
													onClick={() => handleEditTelephonyChannel(channel)}
												>
													<Edit />
												</IconButton>
											</Tooltip>
											<Tooltip title={i18n.t("telephony.confirmDeleteTitle")}>
												<IconButton
													size="small"
													onClick={() => handleDeleteTelephonyChannel(channel)}
												>
													<DeleteIcon />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</Paper>
			</TabPanel>

			{/* ─── Tab 3: Instagram ─── */}
			<TabPanel value={activeTab} index={3} className={classes.tabPanel}>
				<Paper className={classes.mainPaper} variant="outlined">
					<ComingSoonTab icon={InstagramIcon} channelName="Instagram" />
				</Paper>
			</TabPanel>

			{/* ─── Tab 4: Facebook ─── */}
			<TabPanel value={activeTab} index={4} className={classes.tabPanel}>
				<Paper className={classes.mainPaper} variant="outlined">
					<ComingSoonTab icon={FacebookIcon} channelName="Facebook" />
				</Paper>
			</TabPanel>

			{/* ─── Tab 5: Messenger ─── */}
			<TabPanel value={activeTab} index={5} className={classes.tabPanel}>
				<Paper className={classes.mainPaper} variant="outlined">
					<ComingSoonTab icon={ForumIcon} channelName="Messenger" />
				</Paper>
			</TabPanel>
		</MainContainer>
	);
};

export default Connections;
