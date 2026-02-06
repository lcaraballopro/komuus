import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import RefreshIcon from "@material-ui/icons/Refresh";

// Icons
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import PeopleIcon from "@material-ui/icons/People";
import HeadsetMicIcon from "@material-ui/icons/HeadsetMic";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import SmartToyIcon from "@material-ui/icons/Settings"; // Using Settings as bot icon

import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

// Dashboard Components
import StatsCard from "./StatsCard";
import TrendChart from "./Chart";
import QueueDistribution from "./QueueDistribution";
import AgentPerformance from "./AgentPerformance";

const useStyles = makeStyles((theme) => ({
	container: {
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(4),
		[theme.breakpoints.down("xs")]: {
			paddingTop: theme.spacing(2),
			paddingBottom: theme.spacing(2),
			paddingLeft: theme.spacing(1),
			paddingRight: theme.spacing(1),
		},
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down("xs")]: {
			flexDirection: "column",
			alignItems: "flex-start",
			gap: theme.spacing(1),
			marginBottom: theme.spacing(2),
		},
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 700,
		color: theme.palette.text.primary,
		[theme.breakpoints.down("xs")]: {
			fontSize: "1.25rem",
		},
	},
	controls: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
	},
	periodSelect: {
		minWidth: 140,
		"& .MuiSelect-select": {
			paddingTop: theme.spacing(1),
			paddingBottom: theme.spacing(1),
		},
	},
	chartPaper: {
		padding: theme.spacing(2),
		height: 300,
		[theme.breakpoints.down("xs")]: {
			height: 250,
			padding: theme.spacing(1.5),
		},
	},
	sectionTitle: {
		fontSize: "1rem",
		fontWeight: 600,
		marginBottom: theme.spacing(2),
		color: theme.palette.text.primary,
	},
	realTimeSection: {
		marginBottom: theme.spacing(3),
	},
	realTimeCard: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(2),
		borderRadius: 12,
		[theme.breakpoints.down("xs")]: {
			padding: theme.spacing(1.5),
		},
	},
	realTimeIcon: {
		fontSize: 32,
		opacity: 0.7,
	},
	realTimeValue: {
		fontSize: "1.75rem",
		fontWeight: 700,
		lineHeight: 1,
	},
	realTimeLabel: {
		fontSize: "0.8rem",
		color: theme.palette.text.secondary,
	},
	loadingContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		minHeight: 400,
	},
}));

const Dashboard = () => {
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

	const { user } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [period, setPeriod] = useState("7");
	const [dashboardData, setDashboardData] = useState(null);

	const isAdmin = user.profile === "admin";

	// Calculate date range based on period
	const getDateRange = () => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - parseInt(period));
		return {
			startDate: startDate.toISOString().split("T")[0],
			endDate: endDate.toISOString().split("T")[0],
		};
	};

	const fetchDashboardData = async () => {
		try {
			const { startDate, endDate } = getDateRange();
			const { data } = await api.get("/reports/dashboard", {
				params: { startDate, endDate },
			});
			setDashboardData(data);
		} catch (err) {
			console.error("Error fetching dashboard data:", err);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		setLoading(true);
		fetchDashboardData();
	}, [period]);

	// Refresh every 30 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			fetchDashboardData();
		}, 30000);
		return () => clearInterval(interval);
	}, [period]);

	const handleRefresh = () => {
		setRefreshing(true);
		fetchDashboardData();
	};

	if (loading) {
		return (
			<Container maxWidth="lg" className={classes.container}>
				<Box className={classes.loadingContainer}>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	const { tickets, agents, queues, daily, contacts } = dashboardData || {};

	// Calculate today's stats from daily data
	const today = new Date().toISOString().split("T")[0];
	const todayStats = daily?.find((d) => d.date === today) || { created: 0, closed: 0 };

	// Calculate resolution rate
	const resolutionRate = tickets?.total > 0
		? Math.round((tickets.closed / tickets.total) * 100)
		: 0;

	// Calculate trend (comparing first half vs second half of period)
	const halfIndex = Math.floor((daily?.length || 0) / 2);
	const firstHalf = daily?.slice(0, halfIndex) || [];
	const secondHalf = daily?.slice(halfIndex) || [];
	const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.created, 0);
	const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.created, 0);
	const trendValue = firstHalfTotal > 0
		? Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100)
		: 0;
	const trend = trendValue > 0 ? "up" : trendValue < 0 ? "down" : "flat";

	return (
		<Container maxWidth="lg" className={classes.container}>
			{/* Header */}
			<Box className={classes.header}>
				<Typography className={classes.title}>
					{i18n.t("mainDrawer.listItems.dashboard")}
				</Typography>
				<Box className={classes.controls}>
					<FormControl variant="outlined" size="small" className={classes.periodSelect}>
						<Select
							value={period}
							onChange={(e) => setPeriod(e.target.value)}
						>
							<MenuItem value="1">{i18n.t("dashboard.periods.today") || "Hoy"}</MenuItem>
							<MenuItem value="7">{i18n.t("dashboard.periods.week") || "Últimos 7 días"}</MenuItem>
							<MenuItem value="30">{i18n.t("dashboard.periods.month") || "Últimos 30 días"}</MenuItem>
						</Select>
					</FormControl>
					<IconButton
						onClick={handleRefresh}
						disabled={refreshing}
						size="small"
					>
						<RefreshIcon className={refreshing ? "spin" : ""} />
					</IconButton>
				</Box>
			</Box>

			{/* KPI Cards */}
			<Grid container spacing={isMobile ? 2 : 3}>
				<Grid item xs={6} sm={6} md={3}>
					<StatsCard
						title={i18n.t("dashboard.kpis.totalTickets") || "Tickets Período"}
						value={tickets?.total || 0}
						subtitle={`+${todayStats.created} hoy`}
						icon={ConfirmationNumberIcon}
						color="#6366f1"
						trend={trend}
						trendValue={trendValue}
						trendLabel="vs período anterior"
					/>
				</Grid>
				<Grid item xs={6} sm={6} md={3}>
					<StatsCard
						title={i18n.t("dashboard.kpis.resolutionRate") || "Tasa Resolución"}
						value={`${resolutionRate}%`}
						subtitle={`${tickets?.closed || 0} cerrados`}
						icon={CheckCircleIcon}
						color="#10b981"
					/>
				</Grid>
				<Grid item xs={6} sm={6} md={3}>
					<StatsCard
						title={i18n.t("dashboard.kpis.pending") || "Pendientes"}
						value={tickets?.pending || 0}
						subtitle={`${tickets?.open || 0} abiertos`}
						icon={HourglassEmptyIcon}
						color="#f59e0b"
					/>
				</Grid>
				<Grid item xs={6} sm={6} md={3}>
					<StatsCard
						title={i18n.t("dashboard.kpis.newContacts") || "Nuevos Contactos"}
						value={contacts?.newThisPeriod || 0}
						subtitle={`${contacts?.total || 0} total`}
						icon={PeopleIcon}
						color="#ec4899"
					/>
				</Grid>
			</Grid>

			{/* Real-time Status */}
			<Box mt={3} mb={3}>
				<Typography className={classes.sectionTitle}>
					{i18n.t("dashboard.sections.realtime") || "Estado Actual"}
				</Typography>
				<Grid container spacing={isMobile ? 1 : 2}>
					<Grid item xs={6} sm={3}>
						<Paper className={classes.realTimeCard}>
							<HeadsetMicIcon
								className={classes.realTimeIcon}
								style={{ color: theme.palette.primary.main }}
							/>
							<Box>
								<Typography className={classes.realTimeValue}>
									{tickets?.open || 0}
								</Typography>
								<Typography className={classes.realTimeLabel}>
									{i18n.t("dashboard.messages.inAttendance.title")}
								</Typography>
							</Box>
						</Paper>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Paper className={classes.realTimeCard}>
							<HourglassEmptyIcon
								className={classes.realTimeIcon}
								style={{ color: theme.palette.warning.main }}
							/>
							<Box>
								<Typography className={classes.realTimeValue}>
									{tickets?.pending || 0}
								</Typography>
								<Typography className={classes.realTimeLabel}>
									{i18n.t("dashboard.messages.waiting.title")}
								</Typography>
							</Box>
						</Paper>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Paper className={classes.realTimeCard}>
							<SmartToyIcon
								className={classes.realTimeIcon}
								style={{ color: theme.palette.info?.main || "#2196f3" }}
							/>
							<Box>
								<Typography className={classes.realTimeValue}>
									{tickets?.bot || 0}
								</Typography>
								<Typography className={classes.realTimeLabel}>
									{i18n.t("dashboard.messages.withBot") || "Con Bot"}
								</Typography>
							</Box>
						</Paper>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Paper className={classes.realTimeCard}>
							<CheckCircleIcon
								className={classes.realTimeIcon}
								style={{ color: theme.palette.success.main }}
							/>
							<Box>
								<Typography className={classes.realTimeValue}>
									{todayStats.closed}
								</Typography>
								<Typography className={classes.realTimeLabel}>
									{i18n.t("dashboard.messages.closedToday") || "Cerrados hoy"}
								</Typography>
							</Box>
						</Paper>
					</Grid>
				</Grid>
			</Box>

			{/* Charts Section */}
			<Grid container spacing={isMobile ? 2 : 3}>
				{/* Trend Chart */}
				<Grid item xs={12} md={8}>
					<Paper className={classes.chartPaper}>
						<TrendChart
							data={daily || []}
							title={i18n.t("dashboard.charts.trend") || "Tendencia del Período"}
						/>
					</Paper>
				</Grid>

				{/* Queue Distribution */}
				<Grid item xs={12} md={4}>
					<QueueDistribution
						data={queues || []}
						title={i18n.t("dashboard.charts.queueDistribution") || "Por Cola"}
					/>
				</Grid>

				{/* Agent Performance - only for admins */}
				{isAdmin && (
					<Grid item xs={12}>
						<AgentPerformance
							data={agents || []}
							title={i18n.t("dashboard.charts.agentPerformance") || "Top Agentes"}
						/>
					</Grid>
				)}
			</Grid>
		</Container>
	);
};

export default Dashboard;