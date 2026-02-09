import React, { useState, useContext, useMemo } from "react";

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

// Background images for the login page — one is randomly selected on each load
const backgroundImages = [
  "/felipe-salgado-omk7zrFOT-4-unsplash.jpg",
  "/fernanda-fierro-XV4XUU7gWlk-unsplash (1).jpg",
  "/luis-desiro-sVui3lJZCJE-unsplash.jpg",
  "/milo-miloezger-ZLLwL9bKlnk-unsplash.jpg",
  "/alejandro-ortiz-19aBHDuqJIY-unsplash.jpg",
];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
    animation: "$fadeIn 1s ease-out",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.35) 50%, rgba(0, 0, 0, 0.55) 100%)",
    zIndex: 1,
  },
  card: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: 420,
    padding: theme.spacing(5),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    animation: "$slideUp 0.6s ease-out",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
  },
  logo: {
    height: 44,
    marginRight: theme.spacing(1),
    filter: "brightness(0) invert(1)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  title: {
    fontWeight: 700,
    fontSize: "1.75rem",
    color: "#fff",
    marginBottom: theme.spacing(0.5),
    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: "0.875rem",
    marginBottom: theme.spacing(3),
  },
  form: {
    width: "100%",
  },
  label: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: theme.spacing(0.5),
    display: "block",
  },
  textField: {
    marginBottom: theme.spacing(2.5),
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(8px)",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.18)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        "& fieldset": {
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 2,
        },
      },
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px 16px",
      color: "#fff",
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.5)",
        opacity: 1,
      },
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: "rgba(255, 255, 255, 0.6)",
    },
  },
  submit: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 10,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "none",
    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    backdropFilter: "blur(8px)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 100%)",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
      transform: "translateY(-1px)",
    },
  },
  copyright: {
    marginTop: theme.spacing(4),
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "0.75rem",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes slideUp": {
    from: {
      opacity: 0,
      transform: "translateY(30px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const Login = () => {
  const classes = useStyles();

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  // Select a random background image once per component mount
  const randomBg = useMemo(() => {
    const idx = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[idx];
  }, []);

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
      <div
        className={classes.backgroundImage}
        style={{ backgroundImage: `url("${randomBg}")` }}
      />
      <div className={classes.overlay} />
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

