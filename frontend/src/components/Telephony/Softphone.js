import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    IconButton,
    Typography,
    Grid,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Badge
} from "@material-ui/core";
import PhoneIcon from "@material-ui/icons/Phone";
import PhonePausedIcon from "@material-ui/icons/PhonePaused";
import DialpadIcon from "@material-ui/icons/Dialpad";
import SettingsIcon from "@material-ui/icons/Settings";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CallEndIcon from "@material-ui/icons/CallEnd";
import WifiCalling3Icon from "@material-ui/icons/WifiCalling3";
import BackspaceIcon from "@material-ui/icons/Backspace";

import { TelephonyContext } from "../../context/TelephonyContext";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        minWidth: 300,
        maxWidth: 320,
        backgroundColor: theme.palette.background.paper,
    },
    display: {
        marginBottom: theme.spacing(2),
        textAlign: "center",
    },
    input: {
        fontSize: "1.5rem",
        textAlign: "center",
    },
    keypad: {
        marginBottom: theme.spacing(2),
    },
    keyButton: {
        width: "100%",
        height: 48,
        borderRadius: "50%",
        fontSize: "1.2rem",
        fontWeight: "bold",
        margin: theme.spacing(0.5),
    },
    actionButtons: {
        display: "flex",
        justifyContent: "center",
        gap: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
    callButton: {
        backgroundColor: "#4caf50",
        color: "white",
        width: 64,
        height: 64,
        "&:hover": {
            backgroundColor: "#388e3c",
        },
    },
    hangupButton: {
        backgroundColor: "#f44336",
        color: "white",
        width: 64,
        height: 64,
        "&:hover": {
            backgroundColor: "#d32f2f",
        },
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: 8,
    },
    registered: { backgroundColor: "#4caf50" },
    unregistered: { backgroundColor: "#9e9e9e" },
    error: { backgroundColor: "#f44336" },
    dialpadContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    statusRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.spacing(1),
        padding: theme.spacing(0, 1),
    },
}));

const Softphone = () => {
    const classes = useStyles();
    const {
        status,
        callStatus,
        remoteIdentity,
        connect,
        disconnect,
        call,
        answer,
        hangup,
        sendDTMF,
        config,
        saveConfig,
        errorMessage
    } = useContext(TelephonyContext);

    const [tab, setTab] = useState(0);
    const [dialString, setDialString] = useState("");
    const [localConfig, setLocalConfig] = useState(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleKey = (key) => {
        setDialString((prev) => prev + key);
        if (callStatus === "connected") {
            sendDTMF(key);
        }
    };

    const handleBackspace = () => {
        setDialString((prev) => prev.slice(0, -1));
    };

    const handleCall = () => {
        if (dialString) {
            call(dialString);
        } else {
            toast.warn("Ingresa un número");
        }
    };

    const handleSaveConfig = () => {
        saveConfig(localConfig);
        toast.success("Configuración guardada. Conectando...");
        connect();
    };

    const renderKeypad = () => {
        const keys = [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["*", "0", "#"],
        ];

        return (
            <div className={classes.dialpadContainer}>
                {keys.map((row, i) => (
                    <Grid container key={i} justify="center">
                        {row.map((key) => (
                            <Grid item xs={4} key={key} style={{ textAlign: "center" }}>
                                <Button
                                    variant="outlined"
                                    className={classes.keyButton}
                                    onClick={() => handleKey(key)}
                                >
                                    {key}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </div>
        );
    };

    const getStatusColor = () => {
        switch (status) {
            case "registered":
                return classes.registered;
            case "error":
                return classes.error;
            default:
                return classes.unregistered;
        }
    };

    return (
        <Paper className={classes.root} elevation={3}>
            <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                style={{ marginBottom: 16 }}
            >
                <Tab icon={<DialpadIcon />} label="Teléfono" />
                <Tab icon={<SettingsIcon />} label="Ajustes" />
            </Tabs>

            {/* Tab 0: Phone */}
            {tab === 0 && (
                <>
                    <div className={classes.statusRow}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div
                                className={`${classes.statusIndicator} ${getStatusColor()}`}
                            />
                            <Typography variant="caption" style={{ fontWeight: "bold" }}>
                                {status === "registered" ? "Registrado" : status}
                            </Typography>
                        </div>
                        {status !== "registered" && (
                            <Button size="small" color="primary" onClick={connect} disabled={status === "connecting"}>
                                Conectar
                            </Button>
                        )}
                        {status === "registered" && (
                            <Button size="small" onClick={disconnect}>Desconectar</Button>
                        )}
                    </div>

                    {/* Caller Identity / Active Call Info */}
                    {callStatus !== "idle" && (
                        <div style={{ textAlign: "center", marginBottom: 16, padding: 8, backgroundColor: "#e3f2fd", borderRadius: 8 }}>
                            <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                                {callStatus === "ringing" ? "Llamada Entrante..." : callStatus === "dialing" ? "Llamando..." : "En Llamada"}
                            </Typography>
                            <Typography variant="h6">{remoteIdentity || dialString}</Typography>
                        </div>
                    )}

                    {/* Display Input */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={dialString}
                            onChange={(e) => setDialString(e.target.value)}
                            inputProps={{ style: { textAlign: "center", fontSize: "1.2rem" } }}
                            placeholder="Número..."
                        />
                        <IconButton onClick={handleBackspace}>
                            <BackspaceIcon />
                        </IconButton>
                    </div>

                    {/* NumPad */}
                    {renderKeypad()}

                    {/* Action Buttons */}
                    <div className={classes.actionButtons}>
                        {callStatus === "ringing" ? (
                            <>
                                <Fab className={classes.callButton} onClick={answer}>
                                    <PhoneIcon />
                                </Fab>
                                <Fab className={classes.hangupButton} onClick={hangup}>
                                    <CallEndIcon />
                                </Fab>
                            </>
                        ) : callStatus === "connected" || callStatus === "dialing" ? (
                            <Fab className={classes.hangupButton} onClick={hangup}>
                                <CallEndIcon />
                            </Fab>
                        ) : (
                            <Fab
                                className={classes.callButton}
                                onClick={handleCall}
                                disabled={status !== "registered" && status !== "mock"} // Allow verify if mock
                            >
                                <PhoneIcon />
                            </Fab>
                        )}
                    </div>
                </>
            )}

            {/* Tab 1: Settings */}
            {tab === 1 && (
                <div style={{ padding: 8 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Configuración SIP (Temporal)
                    </Typography>
                    <TextField
                        label="Servidor SIP (Domain)"
                        fullWidth
                        margin="dense"
                        value={localConfig.server}
                        onChange={(e) => setLocalConfig({ ...localConfig, server: e.target.value })}
                    />
                    <TextField
                        label="Usuario (Extensión)"
                        fullWidth
                        margin="dense"
                        value={localConfig.username}
                        onChange={(e) => setLocalConfig({ ...localConfig, username: e.target.value })}
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        fullWidth
                        margin="dense"
                        value={localConfig.password}
                        onChange={(e) => setLocalConfig({ ...localConfig, password: e.target.value })}
                    />
                    <TextField
                        label="Puerto WSS (ej: 443, 8089)"
                        fullWidth
                        margin="dense"
                        value={localConfig.port}
                        onChange={(e) => setLocalConfig({ ...localConfig, port: e.target.value })}
                    />
                    <TextField
                        label="Protocolo (wss/ws)"
                        fullWidth
                        margin="dense"
                        value={localConfig.protocol}
                        onChange={(e) => setLocalConfig({ ...localConfig, protocol: e.target.value })}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{ marginTop: 16 }}
                        onClick={handleSaveConfig}
                    >
                        Guardar y Conectar
                    </Button>
                    {errorMessage && (
                        <Typography color="error" variant="caption" style={{ marginTop: 8, display: "block" }}>
                            {errorMessage}
                        </Typography>
                    )}
                </div>
            )}
        </Paper>
    );
};

export default Softphone;
