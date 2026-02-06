import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingFlatIcon from "@material-ui/icons/TrendingFlat";

const useStyles = makeStyles((theme) => ({
    card: {
        padding: theme.spacing(2.5),
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 140,
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
        backdropFilter: "blur(10px)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[8],
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: 120,
            padding: theme.spacing(2),
        },
    },
    iconContainer: {
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(2),
        width: 48,
        height: 48,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        [theme.breakpoints.down("xs")]: {
            width: 40,
            height: 40,
        },
    },
    icon: {
        fontSize: 28,
        color: "inherit",
        [theme.breakpoints.down("xs")]: {
            fontSize: 24,
        },
    },
    title: {
        fontSize: "0.85rem",
        fontWeight: 500,
        opacity: 0.9,
        marginBottom: theme.spacing(0.5),
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    value: {
        fontSize: "2.25rem",
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: theme.spacing(1),
        [theme.breakpoints.down("xs")]: {
            fontSize: "1.75rem",
        },
    },
    footer: {
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(0.5),
    },
    trendUp: {
        color: "#4caf50",
        fontSize: 18,
    },
    trendDown: {
        color: "#f44336",
        fontSize: 18,
    },
    trendFlat: {
        color: "#9e9e9e",
        fontSize: 18,
    },
    trendText: {
        fontSize: "0.75rem",
        opacity: 0.8,
    },
    subtitle: {
        fontSize: "0.75rem",
        opacity: 0.7,
    },
}));

const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "#6366f1",
    trend = null, // "up", "down", "flat"
    trendValue = null,
    trendLabel = "",
}) => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

    const getTrendIcon = () => {
        if (trend === "up") return <TrendingUpIcon className={classes.trendUp} />;
        if (trend === "down") return <TrendingDownIcon className={classes.trendDown} />;
        if (trend === "flat") return <TrendingFlatIcon className={classes.trendFlat} />;
        return null;
    };

    const cardStyle = {
        backgroundColor: color,
        color: theme.palette.getContrastText(color),
    };

    return (
        <Paper className={classes.card} elevation={3} style={cardStyle}>
            <Box className={classes.iconContainer}>
                {Icon && <Icon className={classes.icon} />}
            </Box>
            <Typography className={classes.title}>{title}</Typography>
            <Typography className={classes.value}>{value}</Typography>
            {subtitle && (
                <Typography className={classes.subtitle}>{subtitle}</Typography>
            )}
            {trend && (
                <Box className={classes.footer}>
                    {getTrendIcon()}
                    {trendValue !== null && (
                        <Typography className={classes.trendText}>
                            {trendValue > 0 ? "+" : ""}{trendValue}% {trendLabel}
                        </Typography>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default StatsCard;
