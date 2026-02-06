import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PersonIcon from "@material-ui/icons/Person";
import AssignmentIcon from "@material-ui/icons/Assignment";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import CircularProgress from "@material-ui/core/CircularProgress";
import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";

const drawerWidth = 360;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: theme.palette.primary.main,
		color: "#fff",
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "56px",
		justifyContent: "flex-start",
	},
	headerIcon: {
		color: "#fff",
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.type === "dark" ? "#303030" : "#f5f5f5",
		flexDirection: "column",
		padding: "8px",
		height: "100%",
		overflowY: "auto",
		...theme.scrollbarStyles,
	},
	contactAvatar: {
		margin: "8px auto",
		width: 100,
		height: 100,
		border: `3px solid ${theme.palette.primary.main}`,
	},
	contactHeader: {
		display: "flex",
		padding: 12,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		background: theme.palette.background.paper,
		borderRadius: 8,
		marginBottom: 8,
	},
	contactName: {
		fontWeight: 600,
		marginTop: 8,
	},
	contactNumber: {
		color: theme.palette.text.secondary,
	},
	accordion: {
		marginBottom: 8,
		borderRadius: "8px !important",
		"&:before": {
			display: "none",
		},
		"&.Mui-expanded": {
			margin: "0 0 8px 0",
		},
	},
	accordionSummary: {
		backgroundColor: theme.palette.type === "dark" ? "#424242" : "#fff",
		borderRadius: 8,
		minHeight: "48px !important",
		"&.Mui-expanded": {
			minHeight: "48px !important",
			borderBottomLeftRadius: 0,
			borderBottomRightRadius: 0,
		},
	},
	accordionSummaryContent: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
		"&.Mui-expanded": {
			margin: "12px 0",
		},
	},
	accordionDetails: {
		backgroundColor: theme.palette.background.paper,
		flexDirection: "column",
		padding: theme.spacing(2),
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
	accordionIcon: {
		color: theme.palette.primary.main,
	},
	contactExtraInfo: {
		marginTop: 8,
		padding: 8,
		backgroundColor: theme.palette.type === "dark" ? "#424242" : "#f5f5f5",
		borderRadius: 4,
	},
	formField: {
		marginBottom: theme.spacing(2),
	},
	formActions: {
		display: "flex",
		justifyContent: "flex-end",
		marginTop: theme.spacing(2),
	},
	noFormsMessage: {
		textAlign: "center",
		color: theme.palette.text.secondary,
		padding: theme.spacing(2),
	},
	formSelector: {
		marginBottom: theme.spacing(2),
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, loading, ticketId }) => {
	const classes = useStyles();
	const [modalOpen, setModalOpen] = useState(false);
	const [expandedPanel, setExpandedPanel] = useState("contact");

	// Form state
	const [forms, setForms] = useState([]);
	const [selectedFormId, setSelectedFormId] = useState("");
	const [formFields, setFormFields] = useState([]);
	const [formValues, setFormValues] = useState({});
	const [loadingForms, setLoadingForms] = useState(false);
	const [loadingFields, setLoadingFields] = useState(false);
	const [submittingForm, setSubmittingForm] = useState(false);

	// Fetch available forms
	useEffect(() => {
		if (open) {
			const fetchForms = async () => {
				setLoadingForms(true);
				try {
					const { data } = await api.get("/contact-forms");
					setForms(data);
					if (data.length > 0) {
						setSelectedFormId(data[0].id);
					}
				} catch (err) {
					console.error("Error fetching forms:", err);
				} finally {
					setLoadingForms(false);
				}
			};
			fetchForms();
		}
	}, [open]);

	// Fetch form fields when form is selected
	useEffect(() => {
		if (selectedFormId) {
			const fetchFormDetails = async () => {
				setLoadingFields(true);
				try {
					const { data } = await api.get(`/contact-forms/${selectedFormId}`);
					setFormFields(data.fields || []);
					// Initialize form values
					const initialValues = {};
					(data.fields || []).forEach(field => {
						initialValues[field.id] = field.fieldType === "checkbox" ? false : "";
					});
					setFormValues(initialValues);
				} catch (err) {
					console.error("Error fetching form details:", err);
				} finally {
					setLoadingFields(false);
				}
			};
			fetchFormDetails();
		}
	}, [selectedFormId]);

	const handlePanelChange = panel => (event, isExpanded) => {
		setExpandedPanel(isExpanded ? panel : false);
	};

	const handleValueChange = (fieldId, value) => {
		setFormValues(prev => ({
			...prev,
			[fieldId]: value,
		}));
	};

	const handleSubmitForm = async () => {
		setSubmittingForm(true);
		try {
			const formattedResponses = formFields.map(field => ({
				fieldId: field.id,
				value: String(formValues[field.id] || ""),
			}));

			await api.post("/contact-form-responses", {
				formId: selectedFormId,
				contactId: contact?.id,
				ticketId: ticketId,
				responses: formattedResponses,
			});

			toast.success(i18n.t("contactForms.formFiller.success") || "Formulario enviado exitosamente");
			// Reset form
			const initialValues = {};
			formFields.forEach(field => {
				initialValues[field.id] = field.fieldType === "checkbox" ? false : "";
			});
			setFormValues(initialValues);
		} catch (err) {
			toastError(err);
		} finally {
			setSubmittingForm(false);
		}
	};

	const renderFormField = (field) => {
		const value = formValues[field.id];

		switch (field.fieldType) {
			case "text":
			case "email":
			case "phone":
			case "url":
				return (
					<TextField
						key={field.id}
						fullWidth
						size="small"
						label={field.label}
						type={field.fieldType === "email" ? "email" : field.fieldType === "phone" ? "tel" : "text"}
						required={field.required}
						value={value || ""}
						onChange={e => handleValueChange(field.id, e.target.value)}
						className={classes.formField}
						variant="outlined"
					/>
				);

			case "textarea":
				return (
					<TextField
						key={field.id}
						fullWidth
						size="small"
						label={field.label}
						multiline
						rows={3}
						required={field.required}
						value={value || ""}
						onChange={e => handleValueChange(field.id, e.target.value)}
						className={classes.formField}
						variant="outlined"
					/>
				);

			case "number":
				return (
					<TextField
						key={field.id}
						fullWidth
						size="small"
						label={field.label}
						type="number"
						required={field.required}
						value={value || ""}
						onChange={e => handleValueChange(field.id, e.target.value)}
						className={classes.formField}
						variant="outlined"
					/>
				);

			case "date":
				return (
					<TextField
						key={field.id}
						fullWidth
						size="small"
						label={field.label}
						type="date"
						required={field.required}
						value={value || ""}
						onChange={e => handleValueChange(field.id, e.target.value)}
						className={classes.formField}
						variant="outlined"
						InputLabelProps={{ shrink: true }}
					/>
				);

			case "select":
				const selectOptions = field.options ? field.options.split(",").map(o => o.trim()) : [];
				return (
					<FormControl
						key={field.id}
						fullWidth
						size="small"
						className={classes.formField}
						variant="outlined"
					>
						<InputLabel>{field.label}</InputLabel>
						<Select
							value={value || ""}
							onChange={e => handleValueChange(field.id, e.target.value)}
							label={field.label}
						>
							{selectOptions.map((option, idx) => (
								<MenuItem key={idx} value={option}>{option}</MenuItem>
							))}
						</Select>
					</FormControl>
				);

			case "checkbox":
				return (
					<FormControlLabel
						key={field.id}
						control={
							<Checkbox
								checked={Boolean(value)}
								onChange={e => handleValueChange(field.id, e.target.checked)}
								color="primary"
							/>
						}
						label={field.label}
						className={classes.formField}
					/>
				);

			case "radio":
				const radioOptions = field.options ? field.options.split(",").map(o => o.trim()) : [];
				return (
					<FormControl key={field.id} component="fieldset" className={classes.formField}>
						<Typography variant="body2" color="textSecondary">{field.label}</Typography>
						<RadioGroup
							value={value || ""}
							onChange={e => handleValueChange(field.id, e.target.value)}
						>
							{radioOptions.map((option, idx) => (
								<FormControlLabel
									key={idx}
									value={option}
									control={<Radio color="primary" size="small" />}
									label={option}
								/>
							))}
						</RadioGroup>
					</FormControl>
				);

			default:
				return null;
		}
	};

	return (
		<Drawer
			className={classes.drawer}
			variant="persistent"
			anchor="right"
			open={open}
			PaperProps={{ style: { position: "absolute" } }}
			BackdropProps={{ style: { position: "absolute" } }}
			ModalProps={{
				container: document.getElementById("drawer-container"),
				style: { position: "absolute" },
			}}
			classes={{
				paper: classes.drawerPaper,
			}}
		>
			<div className={classes.header}>
				<IconButton onClick={handleDrawerClose} className={classes.headerIcon}>
					<CloseIcon />
				</IconButton>
				<Typography style={{ justifySelf: "center", fontWeight: 500 }}>
					{i18n.t("contactDrawer.header")}
				</Typography>
			</div>
			{loading ? (
				<ContactDrawerSkeleton classes={classes} />
			) : (
				<div className={classes.content}>
					{/* Contact Avatar Header */}
					<div className={classes.contactHeader}>
						<Avatar
							alt={contact.name}
							src={contact.profilePicUrl}
							className={classes.contactAvatar}
						/>
						<Typography className={classes.contactName}>{contact.name}</Typography>
						<Typography className={classes.contactNumber}>
							<Link href={`tel:${contact.number}`}>{contact.number}</Link>
						</Typography>
						<Button
							variant="outlined"
							color="primary"
							size="small"
							onClick={() => setModalOpen(true)}
							style={{ marginTop: 8 }}
						>
							{i18n.t("contactDrawer.buttons.edit")}
						</Button>
					</div>

					{/* Contact Data Accordion */}
					<Accordion
						expanded={expandedPanel === "contact"}
						onChange={handlePanelChange("contact")}
						className={classes.accordion}
						elevation={0}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							className={classes.accordionSummary}
							classes={{ content: classes.accordionSummaryContent }}
						>
							<PersonIcon className={classes.accordionIcon} />
							<Typography variant="subtitle2">
								{i18n.t("contactDrawer.extraInfo") || "Datos del Contacto"}
							</Typography>
						</AccordionSummary>
						<AccordionDetails className={classes.accordionDetails}>
							{contact?.extraInfo?.length > 0 ? (
								contact.extraInfo.map(info => (
									<Paper
										key={info.id}
										square
										variant="outlined"
										className={classes.contactExtraInfo}
									>
										<InputLabel style={{ fontSize: 12 }}>{info.name}</InputLabel>
										<Typography component="div" noWrap style={{ paddingTop: 2 }}>
											<MarkdownWrapper>{info.value}</MarkdownWrapper>
										</Typography>
									</Paper>
								))
							) : (
								<Typography variant="body2" color="textSecondary" align="center">
									{i18n.t("contactDrawer.noExtraInfo") || "Sin información adicional"}
								</Typography>
							)}
						</AccordionDetails>
					</Accordion>

					{/* Forms Accordion */}
					<Accordion
						expanded={expandedPanel === "form"}
						onChange={handlePanelChange("form")}
						className={classes.accordion}
						elevation={0}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							className={classes.accordionSummary}
							classes={{ content: classes.accordionSummaryContent }}
						>
							<AssignmentIcon className={classes.accordionIcon} />
							<Typography variant="subtitle2">
								{i18n.t("contactForms.formFiller.title") || "Formulario"}
							</Typography>
						</AccordionSummary>
						<AccordionDetails className={classes.accordionDetails}>
							{loadingForms ? (
								<div style={{ textAlign: "center", padding: 16 }}>
									<CircularProgress size={24} />
								</div>
							) : forms.length === 0 ? (
								<Typography className={classes.noFormsMessage}>
									{i18n.t("contactForms.formFiller.noForms") || "No hay formularios disponibles"}
								</Typography>
							) : (
								<>
									{forms.length > 1 && (
										<FormControl fullWidth size="small" className={classes.formSelector} variant="outlined">
											<InputLabel>Seleccionar formulario</InputLabel>
											<Select
												value={selectedFormId}
												onChange={e => setSelectedFormId(e.target.value)}
												label="Seleccionar formulario"
											>
												{forms.map(form => (
													<MenuItem key={form.id} value={form.id}>{form.name}</MenuItem>
												))}
											</Select>
										</FormControl>
									)}

									{loadingFields ? (
										<div style={{ textAlign: "center", padding: 16 }}>
											<CircularProgress size={24} />
										</div>
									) : (
										<>
											{formFields.map(field => renderFormField(field))}

											{formFields.length > 0 && (
												<div className={classes.formActions}>
													<Button
														variant="contained"
														color="primary"
														onClick={handleSubmitForm}
														disabled={submittingForm}
														size="small"
													>
														{submittingForm ? (
															<CircularProgress size={20} color="inherit" />
														) : (
															i18n.t("contactForms.formFiller.submit") || "Enviar"
														)}
													</Button>
												</div>
											)}
										</>
									)}
								</>
							)}
						</AccordionDetails>
					</Accordion>

					<ContactModal
						open={modalOpen}
						onClose={() => setModalOpen(false)}
						contactId={contact.id}
					/>
				</div>
			)}
		</Drawer>
	);
};

export default ContactDrawer;
