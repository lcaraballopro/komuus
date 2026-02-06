import React, { useState, useContext, useMemo, useEffect } from "react";
import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Box,
    useTheme,
    useMediaQuery,
    IconButton,
    Chip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import GetAppIcon from "@material-ui/icons/GetApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import AssessmentIcon from "@material-ui/icons/Assessment";
import PeopleIcon from "@material-ui/icons/People";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import ChatIcon from "@material-ui/icons/Chat";
import VisibilityIcon from "@material-ui/icons/Visibility";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import useReports from "../../hooks/useReports";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
    },
    scrollContainer: {
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        paddingBottom: theme.spacing(10), // Space for mobile taskbar
        WebkitOverflowScrolling: "touch",
    },
    container: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(4),
        [theme.breakpoints.down("xs")]: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
        },
    },
    filterContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        alignItems: "center",
        padding: theme.spacing(2),
        [theme.breakpoints.down("xs")]: {
            gap: theme.spacing(1),
            padding: theme.spacing(1.5),
        },
    },
    filterField: {
        minWidth: 140,
        flex: "1 1 auto",
        [theme.breakpoints.down("xs")]: {
            minWidth: "calc(50% - 8px)",
        },
    },
    filterButtons: {
        display: "flex",
        gap: theme.spacing(1),
        flexWrap: "wrap",
        [theme.breakpoints.down("xs")]: {
            width: "100%",
            justifyContent: "space-between",
            marginTop: theme.spacing(1),
        },
    },
    statCard: {
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background: theme.palette.type === "dark"
            ? "linear-gradient(145deg, #1e1e2d 0%, #2d2d3d 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        boxShadow: theme.palette.type === "dark"
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 4px 20px rgba(0,0,0,0.08)",
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(1.5),
        },
    },
    statIcon: {
        position: "absolute",
        top: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 32,
        opacity: 0.15,
        [theme.breakpoints.down("xs")]: {
            fontSize: 24,
        },
    },
    statValue: {
        fontSize: "1.75rem",
        fontWeight: 700,
        marginBottom: theme.spacing(0.25),
        [theme.breakpoints.down("xs")]: {
            fontSize: "1.4rem",
        },
    },
    statLabel: {
        fontSize: "0.8rem",
        color: theme.palette.text.secondary,
        fontWeight: 500,
        [theme.breakpoints.down("xs")]: {
            fontSize: "0.7rem",
        },
    },
    chartPaper: {
        padding: theme.spacing(2),
        borderRadius: 12,
        background: theme.palette.type === "dark"
            ? "linear-gradient(145deg, #1e1e2d 0%, #2d2d3d 100%)"
            : "#ffffff",
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(1.5),
        },
    },
    chartTitle: {
        marginBottom: theme.spacing(1.5),
        fontWeight: 600,
        fontSize: "1rem",
        [theme.breakpoints.down("xs")]: {
            fontSize: "0.9rem",
        },
    },
    tablePaper: {
        borderRadius: 12,
        overflow: "hidden",
    },
    tableHeader: {
        background: theme.palette.type === "dark" ? "#2d2d3d" : "#f5f5f5",
    },
    exportButton: {
        [theme.breakpoints.down("xs")]: {
            flex: 1,
            minWidth: 0,
        },
    },
    refreshButton: {
        [theme.breakpoints.up("sm")]: {
            marginLeft: "auto",
        },
        [theme.breakpoints.down("xs")]: {
            flex: 1,
        },
    },
    colorOpen: { color: theme.palette.primary.main },
    colorPending: { color: theme.palette.warning.main },
    colorClosed: { color: theme.palette.success.main },
    colorTotal: { color: theme.palette.info.main },
}));

const COLORS = ["#3f51b5", "#ff9800", "#4caf50", "#f44336", "#9c27b0", "#00bcd4"];

const Reports = () => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { user } = useContext(AuthContext);

    // Date filters - default to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [filters, setFilters] = useState({
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
        userId: "",
        queueId: "",
    });

    const { data, loading, refresh, detailedTickets, detailedLoading, fetchDetailedTickets } = useReports(filters);

    // Fetch detailed tickets when filters change or on mount
    useEffect(() => {
        fetchDetailedTickets(1, 10);
    }, [fetchDetailedTickets]);

    const handlePageChange = (event, newPage) => {
        fetchDetailedTickets(newPage + 1, detailedTickets.limit);
    };

    const handleRowsPerPageChange = (event) => {
        fetchDetailedTickets(1, parseInt(event.target.value, 10));
    };

    // Format duration in seconds to readable format
    const formatDuration = (seconds) => {
        if (!seconds || seconds <= 0) return "-";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            open: { label: "Abierto", color: "primary" },
            pending: { label: "Pendiente", color: "default" },
            closed: { label: "Cerrado", color: "default" },
            bot: { label: "Bot", color: "secondary" }
        };
        const config = statusConfig[status] || { label: status, color: "default" };
        return <Chip size="small" label={config.label} color={config.color} />;
    };

    const handleViewTicket = (ticketId) => {
        window.open(`/tickets/${ticketId}`, "_blank");
    };

    const handleFilterChange = (field) => (event) => {
        setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleExportExcel = async () => {
        try {
            const XLSX = await import("xlsx");

            // Prepare sheets
            const ticketSheet = XLSX.utils.json_to_sheet([data.tickets]);
            const agentSheet = XLSX.utils.json_to_sheet(data.agents);
            const queueSheet = XLSX.utils.json_to_sheet(data.queues);
            const dailySheet = XLSX.utils.json_to_sheet(data.daily);

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, ticketSheet, "Resumen Tickets");
            XLSX.utils.book_append_sheet(workbook, agentSheet, "Agentes");
            XLSX.utils.book_append_sheet(workbook, queueSheet, "Colas");
            XLSX.utils.book_append_sheet(workbook, dailySheet, "Diario");

            XLSX.writeFile(workbook, `reporte_${filters.startDate}_${filters.endDate}.xlsx`);
        } catch (err) {
            console.error("Error exporting Excel:", err);
        }
    };

    const handleExportPDF = async () => {
        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("Reporte de Tickets", 14, 22);
            doc.setFontSize(11);
            doc.text(`Período: ${filters.startDate} - ${filters.endDate}`, 14, 30);

            // Summary
            doc.setFontSize(14);
            doc.text("Resumen", 14, 42);
            autoTable(doc, {
                startY: 46,
                head: [["Total", "Abiertos", "Pendientes", "Cerrados", "Bot"]],
                body: [[data.tickets.total, data.tickets.open, data.tickets.pending, data.tickets.closed, data.tickets.bot]],
            });

            // Agents
            doc.text("Rendimiento de Agentes", 14, doc.lastAutoTable.finalY + 14);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 18,
                head: [["Agente", "Total", "Cerrados", "Abiertos"]],
                body: data.agents.map(a => [a.userName, a.totalTickets, a.closedTickets, a.openTickets]),
            });

            doc.save(`reporte_${filters.startDate}_${filters.endDate}.pdf`);
        } catch (err) {
            console.error("Error exporting PDF:", err);
        }
    };

    // Chart data
    const pieData = useMemo(() => [
        { name: "Abiertos", value: data.tickets.open },
        { name: "Pendientes", value: data.tickets.pending },
        { name: "Cerrados", value: data.tickets.closed },
        { name: "Bot", value: data.tickets.bot },
    ].filter(d => d.value > 0), [data.tickets]);

    return (
        <div className={classes.root}>
            <MainHeader>
                <Title>{i18n.t("reports.title") || "Reportes"}</Title>
            </MainHeader>

            <div className={classes.scrollContainer}>
                <Container maxWidth="xl" className={classes.container}>
                    {/* Filters */}
                    <Paper className={classes.chartPaper} style={{ marginBottom: 16 }}>
                        <Box className={classes.filterContainer}>
                            <TextField
                                label={i18n.t("reports.filters.startDate") || "Fecha inicio"}
                                type="date"
                                value={filters.startDate}
                                onChange={handleFilterChange("startDate")}
                                InputLabelProps={{ shrink: true }}
                                className={classes.filterField}
                                variant="outlined"
                                size="small"
                            />
                            <TextField
                                label={i18n.t("reports.filters.endDate") || "Fecha fin"}
                                type="date"
                                value={filters.endDate}
                                onChange={handleFilterChange("endDate")}
                                InputLabelProps={{ shrink: true }}
                                className={classes.filterField}
                                variant="outlined"
                                size="small"
                            />
                            <Box className={classes.filterButtons}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={!isMobile && <GetAppIcon />}
                                    onClick={handleExportExcel}
                                    className={classes.exportButton}
                                    size="small"
                                >
                                    Excel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={!isMobile && <GetAppIcon />}
                                    onClick={handleExportPDF}
                                    className={classes.exportButton}
                                    size="small"
                                >
                                    PDF
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={loading ? <CircularProgress size={18} /> : (!isMobile && <RefreshIcon />)}
                                    onClick={refresh}
                                    disabled={loading}
                                    className={classes.refreshButton}
                                    size="small"
                                >
                                    {isMobile ? (loading ? "" : "↻") : (i18n.t("reports.refresh") || "Actualizar")}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Stats Cards */}
                    <Grid container spacing={isMobile ? 1 : 2} style={{ marginBottom: 16 }}>
                        <Grid item xs={6} sm={3}>
                            <Paper className={classes.statCard}>
                                <AssessmentIcon className={`${classes.statIcon} ${classes.colorTotal}`} />
                                <Typography className={`${classes.statValue} ${classes.colorTotal}`}>
                                    {data.tickets.total}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    {i18n.t("reports.stats.total") || "Total Tickets"}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Paper className={classes.statCard}>
                                <ChatIcon className={`${classes.statIcon} ${classes.colorOpen}`} />
                                <Typography className={`${classes.statValue} ${classes.colorOpen}`}>
                                    {data.tickets.open}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    {i18n.t("reports.stats.open") || "Abiertos"}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Paper className={classes.statCard}>
                                <HourglassEmptyIcon className={`${classes.statIcon} ${classes.colorPending}`} />
                                <Typography className={`${classes.statValue} ${classes.colorPending}`}>
                                    {data.tickets.pending}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    {i18n.t("reports.stats.pending") || "Pendientes"}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Paper className={classes.statCard}>
                                <CheckCircleIcon className={`${classes.statIcon} ${classes.colorClosed}`} />
                                <Typography className={`${classes.statValue} ${classes.colorClosed}`}>
                                    {data.tickets.closed}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    {i18n.t("reports.stats.closed") || "Cerrados"}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Charts Row */}
                    <Grid container spacing={isMobile ? 1 : 2} style={{ marginBottom: 16 }}>
                        {/* Daily Chart */}
                        <Grid item xs={12} md={8}>
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" className={classes.chartTitle}>
                                    {i18n.t("reports.charts.daily") || "Tickets por Día"}
                                </Typography>
                                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                                    <LineChart data={data.daily}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                            tickFormatter={(val) => val.slice(5)}
                                        />
                                        <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: theme.palette.background.paper,
                                                border: `1px solid ${theme.palette.divider}`
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="created"
                                            name="Creados"
                                            stroke="#3f51b5"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="closed"
                                            name="Cerrados"
                                            stroke="#4caf50"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Pie Chart */}
                        <Grid item xs={12} md={4}>
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" className={classes.chartTitle}>
                                    {i18n.t("reports.charts.distribution") || "Distribución por Estado"}
                                </Typography>
                                <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Agent Performance Bar Chart */}
                    <Grid container spacing={isMobile ? 1 : 2} style={{ marginBottom: 16 }}>
                        <Grid item xs={12}>
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" className={classes.chartTitle}>
                                    {i18n.t("reports.charts.agentPerformance") || "Rendimiento por Agente"}
                                </Typography>
                                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                                    <BarChart data={data.agents.slice(0, 10)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis type="number" tick={{ fill: theme.palette.text.secondary }} />
                                        <YAxis
                                            type="category"
                                            dataKey="userName"
                                            width={120}
                                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: theme.palette.background.paper,
                                                border: `1px solid ${theme.palette.divider}`
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="closedTickets" name="Cerrados" fill="#4caf50" />
                                        <Bar dataKey="openTickets" name="Abiertos" fill="#3f51b5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Queue Stats Table */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper className={classes.tablePaper}>
                                <Typography variant="h6" style={{ padding: 16 }}>
                                    {i18n.t("reports.tables.queues") || "Estadísticas por Cola"}
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead className={classes.tableHeader}>
                                            <TableRow>
                                                <TableCell>Cola</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                                <TableCell align="right">Abiertos</TableCell>
                                                <TableCell align="right">Pendientes</TableCell>
                                                <TableCell align="right">Cerrados</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.queues.map((queue) => (
                                                <TableRow key={queue.queueId}>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center">
                                                            <Box
                                                                style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: "50%",
                                                                    backgroundColor: queue.queueColor,
                                                                    marginRight: 8,
                                                                }}
                                                            />
                                                            {queue.queueName}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">{queue.totalTickets}</TableCell>
                                                    <TableCell align="right">{queue.openTickets}</TableCell>
                                                    <TableCell align="right">{queue.pendingTickets}</TableCell>
                                                    <TableCell align="right">{queue.closedTickets}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Agent Performance Table */}
                        <Grid item xs={12} md={6}>
                            <Paper className={classes.tablePaper}>
                                <Typography variant="h6" style={{ padding: 16 }}>
                                    {i18n.t("reports.tables.agents") || "Detalle por Agente"}
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead className={classes.tableHeader}>
                                            <TableRow>
                                                <TableCell>Agente</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                                <TableCell align="right">Cerrados</TableCell>
                                                <TableCell align="right">Abiertos</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.agents.map((agent) => (
                                                <TableRow key={agent.userId}>
                                                    <TableCell>{agent.userName}</TableCell>
                                                    <TableCell align="right">{agent.totalTickets}</TableCell>
                                                    <TableCell align="right">{agent.closedTickets}</TableCell>
                                                    <TableCell align="right">{agent.openTickets}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Contacts Stats */}
                    <Grid container spacing={3} style={{ marginTop: 24 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper className={classes.statCard}>
                                <PeopleIcon className={`${classes.statIcon} ${classes.colorTotal}`} />
                                <Typography className={`${classes.statValue} ${classes.colorTotal}`}>
                                    {data.contacts.total}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    {i18n.t("reports.stats.totalContacts") || "Total Contactos"}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper className={classes.statCard}>
                                <PeopleIcon className={`${classes.statIcon} ${classes.colorClosed}`} />
                                <Typography className={`${classes.statValue} ${classes.colorClosed}`}>
                                    {data.contacts.newThisPeriod}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    {i18n.t("reports.stats.newContacts") || "Nuevos en el Período"}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Detailed Conversations Table */}
                    <Grid container spacing={isMobile ? 1 : 2} style={{ marginTop: 16 }}>
                        <Grid item xs={12}>
                            <Paper className={classes.tablePaper}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" padding={2}>
                                    <Typography variant="h6" className={classes.chartTitle} style={{ marginBottom: 0 }}>
                                        {i18n.t("reports.tables.conversations") || "Historial de Conversaciones"}
                                    </Typography>
                                    {detailedLoading && <CircularProgress size={24} />}
                                </Box>
                                <TableContainer style={{ maxHeight: isMobile ? 400 : 500, overflow: "auto" }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead className={classes.tableHeader}>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Contacto</TableCell>
                                                {!isMobile && <TableCell>Cola</TableCell>}
                                                <TableCell>Agente</TableCell>
                                                <TableCell>Inicio</TableCell>
                                                {!isMobile && <TableCell>Fin</TableCell>}
                                                <TableCell>T. Bot</TableCell>
                                                <TableCell>T. Agente</TableCell>
                                                {!isMobile && <TableCell>Total</TableCell>}
                                                <TableCell>Estado</TableCell>
                                                <TableCell align="center">Ver</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detailedTickets.tickets.map((ticket) => (
                                                <TableRow key={ticket.id} hover>
                                                    <TableCell>{ticket.protocol}</TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" noWrap style={{ maxWidth: isMobile ? 100 : 150 }}>
                                                                {ticket.contactName}
                                                            </Typography>
                                                            {!isMobile && (
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {ticket.contactNumber}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell>
                                                            {ticket.queueName ? (
                                                                <Box display="flex" alignItems="center">
                                                                    <Box
                                                                        style={{
                                                                            width: 10,
                                                                            height: 10,
                                                                            borderRadius: "50%",
                                                                            backgroundColor: ticket.queueColor || "#999",
                                                                            marginRight: 6,
                                                                        }}
                                                                    />
                                                                    {ticket.queueName}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" color="textSecondary">-</Typography>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>{ticket.agentName || "-"}</TableCell>
                                                    <TableCell>
                                                        {new Date(ticket.createdAt).toLocaleString("es", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell>
                                                            {ticket.closedAt
                                                                ? new Date(ticket.closedAt).toLocaleString("es", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })
                                                                : "-"
                                                            }
                                                        </TableCell>
                                                    )}
                                                    <TableCell>{formatDuration(ticket.botDuration)}</TableCell>
                                                    <TableCell>{formatDuration(ticket.agentDuration)}</TableCell>
                                                    {!isMobile && <TableCell>{formatDuration(ticket.totalDuration)}</TableCell>}
                                                    <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleViewTicket(ticket.id)}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {detailedTickets.tickets.length === 0 && !detailedLoading && (
                                                <TableRow>
                                                    <TableCell colSpan={isMobile ? 8 : 11} align="center">
                                                        <Typography variant="body2" color="textSecondary">
                                                            No hay conversaciones en este período
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    component="div"
                                    count={detailedTickets.total}
                                    page={detailedTickets.page - 1}
                                    onPageChange={handlePageChange}
                                    rowsPerPage={detailedTickets.limit}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    labelRowsPerPage={isMobile ? "" : "Filas:"}
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </div>
    );
};

export default Reports;


