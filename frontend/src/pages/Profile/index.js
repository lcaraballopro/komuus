import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
    Button,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
    Container,
    Paper,
    Typography,
    Avatar,
    Box,
} from "@material-ui/core";

import { Visibility, VisibilityOff, PersonOutline } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing(4),
        minHeight: "calc(100vh - 120px)",
    },
    paper: {
        padding: theme.spacing(4),
        width: "100%",
        maxWidth: 500,
        borderRadius: 16,
        boxShadow: theme.palette.type === "dark"
            ? "0 8px 32px rgba(0, 0, 0, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.1)",
    },
    header: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: theme.spacing(4),
    },
    avatar: {
        width: 80,
        height: 80,
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
    },
    title: {
        fontWeight: 600,
    },
    subtitle: {
        color: theme.palette.text.secondary,
        marginTop: theme.spacing(0.5),
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
    },
    fieldRow: {
        display: "flex",
        gap: theme.spacing(2),
        [theme.breakpoints.down("xs")]: {
            flexDirection: "column",
        },
    },
    btnWrapper: {
        position: "relative",
        marginTop: theme.spacing(3),
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    saveButton: {
        padding: theme.spacing(1.5),
        fontWeight: 600,
        borderRadius: 8,
    },
}));

const ProfileSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Muy corto!")
        .max(50, "Muy largo!")
        .required("Requerido"),
    password: Yup.string().min(5, "Muy corto!").max(50, "Muy largo!"),
    email: Yup.string().email("Email inválido").required("Requerido"),
});

const Profile = () => {
    const classes = useStyles();
    const history = useHistory();

    const { user: loggedInUser } = useContext(AuthContext);

    const initialState = {
        name: "",
        email: "",
        password: "",
    };

    const [user, setUser] = useState(initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!loggedInUser?.id) return;
            try {
                const { data } = await api.get(`/users/${loggedInUser.id}`);
                setUser({
                    name: data.name || "",
                    email: data.email || "",
                    password: "",
                });
            } catch (err) {
                toastError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [loggedInUser]);

    const handleSaveProfile = async (values) => {
        const userData = { ...values };
        // Don't send empty password
        if (!userData.password) {
            delete userData.password;
        }
        try {
            await api.put(`/users/${loggedInUser.id}`, userData);
            toast.success(i18n.t("userModal.success"));
        } catch (err) {
            toastError(err);
        }
    };

    if (loading) {
        return (
            <div className={classes.root}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <Container maxWidth="sm">
                <Paper className={classes.paper}>
                    <div className={classes.header}>
                        <Avatar className={classes.avatar}>
                            <PersonOutline style={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" className={classes.title}>
                            {i18n.t("userModal.title.edit")}
                        </Typography>
                        <Typography variant="body2" className={classes.subtitle}>
                            {loggedInUser?.email}
                        </Typography>
                    </div>

                    <Formik
                        initialValues={user}
                        enableReinitialize={true}
                        validationSchema={ProfileSchema}
                        onSubmit={(values, actions) => {
                            setTimeout(() => {
                                handleSaveProfile(values);
                                actions.setSubmitting(false);
                            }, 400);
                        }}
                    >
                        {({ touched, errors, isSubmitting }) => (
                            <Form className={classes.form}>
                                <Field
                                    as={TextField}
                                    label={i18n.t("userModal.form.name")}
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    fullWidth
                                />

                                <Field
                                    as={TextField}
                                    label={i18n.t("userModal.form.email")}
                                    name="email"
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                    variant="outlined"
                                    fullWidth
                                />

                                <Field
                                    as={TextField}
                                    name="password"
                                    variant="outlined"
                                    label={i18n.t("userModal.form.password")}
                                    placeholder="Dejar vacío para mantener"
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    type={showPassword ? "text" : "password"}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword((e) => !e)}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    fullWidth
                                />

                                <div className={classes.btnWrapper}>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                        fullWidth
                                        className={classes.saveButton}
                                    >
                                        {i18n.t("userModal.buttons.okEdit")}
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                className={classes.buttonProgress}
                                            />
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Container>
        </div>
    );
};

export default Profile;
