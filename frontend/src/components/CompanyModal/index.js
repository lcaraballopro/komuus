import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    makeStyles,
    CircularProgress,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
    textField: {
        marginBottom: theme.spacing(2),
    },
    btnWrapper: {
        position: "relative",
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));

const CompanyModal = ({ open, onClose, companyId }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState({
        name: "",
        slug: "",
        plan: "basic",
        isActive: true,
        maxUsers: 10,
        maxWhatsapps: 2,
    });

    useEffect(() => {
        const fetchCompany = async () => {
            if (!companyId) {
                setCompany({
                    name: "",
                    slug: "",
                    plan: "basic",
                    isActive: true,
                    maxUsers: 10,
                    maxWhatsapps: 2,
                });
                return;
            }
            try {
                const { data } = await api.get(`/companies/${companyId}`);
                setCompany(data);
            } catch (err) {
                toast.error(err.message);
            }
        };

        fetchCompany();
    }, [companyId, open]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setCompany((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (companyId) {
                await api.put(`/companies/${companyId}`, company);
                toast.success(i18n.t("companies.toasts.updated"));
            } else {
                await api.post("/companies", company);
                toast.success(i18n.t("companies.toasts.created"));
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {companyId
                    ? i18n.t("companyModal.title.edit")
                    : i18n.t("companyModal.title.add")}
            </DialogTitle>
            <DialogContent>
                <TextField
                    className={classes.textField}
                    label={i18n.t("companyModal.form.name")}
                    name="name"
                    value={company.name}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    autoFocus
                />
                <TextField
                    className={classes.textField}
                    label={i18n.t("companyModal.form.slug")}
                    name="slug"
                    value={company.slug}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    helperText={i18n.t("companyModal.form.slugHelp")}
                />
                <FormControl
                    className={classes.textField}
                    fullWidth
                    variant="outlined"
                >
                    <InputLabel>{i18n.t("companyModal.form.plan")}</InputLabel>
                    <Select
                        name="plan"
                        value={company.plan}
                        onChange={handleChange}
                        label={i18n.t("companyModal.form.plan")}
                    >
                        <MenuItem value="basic">Basic</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="enterprise">Enterprise</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    className={classes.textField}
                    label={i18n.t("companyModal.form.maxUsers")}
                    name="maxUsers"
                    type="number"
                    value={company.maxUsers}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                />
                <TextField
                    className={classes.textField}
                    label={i18n.t("companyModal.form.maxWhatsapps")}
                    name="maxWhatsapps"
                    type="number"
                    value={company.maxWhatsapps}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={company.isActive}
                            onChange={handleChange}
                            name="isActive"
                            color="primary"
                        />
                    }
                    label={i18n.t("companyModal.form.isActive")}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={loading}>
                    {i18n.t("companyModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                    >
                        {companyId
                            ? i18n.t("companyModal.buttons.update")
                            : i18n.t("companyModal.buttons.create")}
                    </Button>
                    {loading && (
                        <CircularProgress
                            size={24}
                            className={classes.buttonProgress}
                        />
                    )}
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default CompanyModal;
