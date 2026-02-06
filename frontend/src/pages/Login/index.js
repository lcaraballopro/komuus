import React, { useState, useContext } from "react";

import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from '@material-ui/core';

import { Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(97, 87, 255, 0.08) 0%, transparent 60%)",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: theme.spacing(5),
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
  },
  logo: {
    height: 40,
    marginRight: theme.spacing(1),
    filter: "invert(1) brightness(0.2)",
  },
  logoText: {
    fontWeight: 600,
    fontSize: "1.25rem",
    color: "#3f51b5",
  },
  title: {
    fontWeight: 700,
    fontSize: "1.75rem",
    color: "#1a1a2e",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#666",
    fontSize: "0.875rem",
    marginBottom: theme.spacing(3),
  },
  form: {
    width: "100%",
  },
  label: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#333",
    marginBottom: theme.spacing(0.5),
    display: "block",
  },
  textField: {
    marginBottom: theme.spacing(2.5),
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      backgroundColor: "#fafafa",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#f5f5f5",
      },
      "&.Mui-focused": {
        backgroundColor: "#fff",
        "& fieldset": {
          borderColor: "#3f51b5",
          borderWidth: 2,
        },
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px 16px",
    },
  },
  submit: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "none",
    background: "linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(63, 81, 181, 0.4)",
      transform: "translateY(-1px)",
    },
  },
  copyright: {
    marginTop: theme.spacing(4),
    textAlign: "center",
    color: "#999",
    fontSize: "0.75rem",
  },
}));

const Login = () => {
  const classes = useStyles();

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Box className={classes.card}>
        <div className={classes.logoContainer}>
          <img
            src="/login-logo.png"
            alt="Komu Logo"
            className={classes.logo}
          />
        </div>

        <Typography className={classes.title}>
          {i18n.t("login.title")}
        </Typography>

        <Typography className={classes.subtitle}>
          Ingresa tus credenciales para continuar
        </Typography>

        <form className={classes.form} noValidate onSubmit={handlSubmit}>
          <label className={classes.label}>
            {i18n.t("login.form.email")}
          </label>
          <TextField
            variant="outlined"
            required
            fullWidth
            id="email"
            name="email"
            value={user.email}
            onChange={handleChangeInput}
            autoComplete="email"
            autoFocus
            placeholder="tu@email.com"
            className={classes.textField}
          />

          <label className={classes.label}>
            {i18n.t("login.form.password")}
          </label>
          <TextField
            variant="outlined"
            required
            fullWidth
            name="password"
            id="password"
            value={user.password}
            onChange={handleChangeInput}
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={classes.textField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((e) => !e)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {i18n.t("login.buttons.submit")}
          </Button>
        </form>

        <Typography className={classes.copyright}>
          © {new Date().getFullYear()} Komu. Todos los derechos reservados.
        </Typography>
      </Box>
    </div>
  );
};

export default Login;
