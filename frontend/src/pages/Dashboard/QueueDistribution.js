import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(2),
        height: "100%",
        minHeight: 300,
        [theme.breakpoints.down("xs")]: {
            minHeight: 280,
            padding: theme.spacing(1.5),
        },
    },
    title: {
        fontSize: "1rem",
        fontWeight: 600,
        marginBottom: theme.spacing(2),
        color: theme.palette.text.primary,
    },
    chartContainer: {
        height: "calc(100% - 40px)",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
        marginBottom: theme.spacing(0.5),
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    legendText: {
        fontSize: "0.8rem",
        color: theme.palette.text.secondary,
    },
    noData: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: theme.palette.text.secondary,
        fontStyle: "italic",
    },
}));

const QueueDistribution = ({ data = [], title = "Distribución por Cola" }) => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

    // Transform queue stats data for the pie chart
    const chartData = data
        .filter((queue) => queue.totalTickets > 0)
        .map((queue) => ({
            name: queue.queueName,
            value: queue.totalTickets,
            color: queue.queueColor || theme.palette.grey[500],
            open: queue.openTickets,
            pending: queue.pendingTickets,
            closed: queue.closedTickets,
        }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Paper
                    style={{
                        padding: theme.spacing(1.5),
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        style={{ fontWeight: 600, marginBottom: 4 }}
                    >
                        {data.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Total: {data.value}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#4caf50" }}>
                        Abiertos: {data.open}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#ff9800" }}>
                        Pendientes: {data.pending}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#2196f3" }}>
                        Cerrados: {data.closed}
                    </Typography>
                </Paper>
            );
        }
        return null;
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <Box
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: theme.spacing(2),
                    marginTop: theme.spacing(1),
                }}
            >
                {payload.map((entry, index) => (
                    <Box key={index} className={classes.legendItem}>
                        <Box
                            className={classes.legendColor}
                            style={{ backgroundColor: entry.color }}
                        />
                        <Typography className={classes.legendText}>
                            {entry.value} ({entry.payload.value})
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    if (chartData.length === 0) {
        return (
            <Paper className={classes.container} elevation={2}>
                <Typography className={classes.title}>{title}</Typography>
                <Box className={classes.noData}>
                    <Typography>Sin datos disponibles</Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper className={classes.container} elevation={2}>
            <Typography className={classes.title}>{title}</Typography>
            <Box className={classes.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={isMobile ? 40 : 60}
                            outerRadius={isMobile ? 70 : 90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default QueueDistribution;
