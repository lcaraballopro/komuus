import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import LinearProgress from "@material-ui/core/LinearProgress";
import PersonIcon from "@material-ui/icons/Person";

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
    agentList: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(1.5),
        overflowY: "auto",
        maxHeight: "calc(100% - 40px)",
    },
    agentItem: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1.5),
        padding: theme.spacing(1.5),
        borderRadius: 12,
        backgroundColor: theme.palette.action.hover,
        transition: "background-color 0.2s ease",
        "&:hover": {
            backgroundColor: theme.palette.action.selected,
        },
    },
    avatar: {
        width: 40,
        height: 40,
        backgroundColor: theme.palette.primary.main,
        fontSize: "1rem",
        fontWeight: 600,
    },
    agentInfo: {
        flex: 1,
        minWidth: 0,
    },
    agentName: {
        fontSize: "0.9rem",
        fontWeight: 600,
        color: theme.palette.text.primary,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    agentStats: {
        display: "flex",
        gap: theme.spacing(2),
        marginTop: theme.spacing(0.5),
    },
    stat: {
        fontSize: "0.75rem",
        color: theme.palette.text.secondary,
    },
    statValue: {
        fontWeight: 600,
        color: theme.palette.text.primary,
    },
    progressContainer: {
        width: 80,
        [theme.breakpoints.down("xs")]: {
            width: 60,
        },
    },
    progress: {
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.palette.grey[300],
    },
    progressBar: {
        borderRadius: 3,
    },
    ticketCount: {
        fontSize: "1.1rem",
        fontWeight: 700,
        color: theme.palette.primary.main,
        textAlign: "right",
        minWidth: 40,
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

const AgentPerformance = ({ data = [], title = "Rendimiento de Agentes" }) => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

    // Sort by total tickets and take top 5
    const topAgents = [...data]
        .sort((a, b) => b.totalTickets - a.totalTickets)
        .slice(0, 5);

    const maxTickets = topAgents.length > 0 ? topAgents[0].totalTickets : 1;

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getProgressColor = (closedRatio) => {
        if (closedRatio >= 0.7) return theme.palette.success.main;
        if (closedRatio >= 0.4) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    if (topAgents.length === 0) {
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
            <Box className={classes.agentList}>
                {topAgents.map((agent, index) => {
                    const closedRatio =
                        agent.totalTickets > 0
                            ? agent.closedTickets / agent.totalTickets
                            : 0;

                    return (
                        <Box key={agent.userId} className={classes.agentItem}>
                            <Avatar className={classes.avatar}>
                                {getInitials(agent.userName)}
                            </Avatar>
                            <Box className={classes.agentInfo}>
                                <Typography className={classes.agentName}>
                                    {agent.userName}
                                </Typography>
                                {!isMobile && (
                                    <Box className={classes.agentStats}>
                                        <Typography className={classes.stat}>
                                            Abiertos:{" "}
                                            <span className={classes.statValue}>
                                                {agent.openTickets}
                                            </span>
                                        </Typography>
                                        <Typography className={classes.stat}>
                                            Cerrados:{" "}
                                            <span className={classes.statValue}>
                                                {agent.closedTickets}
                                            </span>
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Box className={classes.progressContainer}>
                                <LinearProgress
                                    variant="determinate"
                                    value={(agent.totalTickets / maxTickets) * 100}
                                    className={classes.progress}
                                    classes={{
                                        bar: classes.progressBar,
                                    }}
                                    style={{
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: getProgressColor(closedRatio),
                                        },
                                    }}
                                />
                            </Box>
                            <Typography className={classes.ticketCount}>
                                {agent.totalTickets}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};

export default AgentPerformance;
