import React from "react";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";

const TrendChart = ({ data = [], title = "Tendencia Semanal" }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

	// Transform daily stats data
	const chartData = data.map((item) => ({
		date: formatDate(item.date),
		created: item.created,
		closed: item.closed,
	}));

	function formatDate(dateStr) {
		const date = new Date(dateStr);
		const options = { weekday: "short", day: "numeric" };
		return date.toLocaleDateString("es-ES", options);
	}

	const chartMargins = isMobile
		? { top: 10, right: 10, bottom: 0, left: -20 }
		: { top: 10, right: 30, bottom: 0, left: 0 };

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<Paper
					style={{
						padding: theme.spacing(1.5),
						backgroundColor: theme.palette.background.paper,
						border: `1px solid ${theme.palette.divider}`,
					}}
				>
					<Typography variant="subtitle2" style={{ fontWeight: 600 }}>
						{label}
					</Typography>
					{payload.map((entry, index) => (
						<Typography
							key={index}
							variant="body2"
							style={{ color: entry.color }}
						>
							{entry.name}: {entry.value}
						</Typography>
					))}
				</Paper>
			);
		}
		return null;
	};

	if (chartData.length === 0) {
		return (
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					color: theme.palette.text.secondary,
				}}
			>
				<Typography>Sin datos disponibles</Typography>
			</Box>
		);
	}

	return (
		<React.Fragment>
			<Typography
				variant="subtitle1"
				style={{
					fontWeight: 600,
					marginBottom: theme.spacing(1),
					color: theme.palette.text.primary,
				}}
			>
				{title}
			</Typography>
			<ResponsiveContainer width="100%" height="85%">
				<AreaChart data={chartData} margin={chartMargins}>
					<defs>
						<linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="5%"
								stopColor={theme.palette.primary.main}
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor={theme.palette.primary.main}
								stopOpacity={0}
							/>
						</linearGradient>
						<linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="5%"
								stopColor={theme.palette.success.main}
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor={theme.palette.success.main}
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke={theme.palette.divider}
						vertical={false}
					/>
					<XAxis
						dataKey="date"
						stroke={theme.palette.text.secondary}
						tick={{ fontSize: isMobile ? 10 : 12 }}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						stroke={theme.palette.text.secondary}
						tick={{ fontSize: isMobile ? 10 : 12 }}
						tickLine={false}
						axisLine={false}
						allowDecimals={false}
						width={isMobile ? 30 : 40}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Legend
						wrapperStyle={{
							paddingTop: theme.spacing(1),
							fontSize: isMobile ? 11 : 12,
						}}
					/>
					<Area
						type="monotone"
						dataKey="created"
						name="Creados"
						stroke={theme.palette.primary.main}
						strokeWidth={2}
						fillOpacity={1}
						fill="url(#colorCreated)"
					/>
					<Area
						type="monotone"
						dataKey="closed"
						name="Cerrados"
						stroke={theme.palette.success.main}
						strokeWidth={2}
						fillOpacity={1}
						fill="url(#colorClosed)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default TrendChart;
