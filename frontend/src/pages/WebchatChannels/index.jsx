import React, { useState, useEffect, useReducer, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Paper,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Typography,
    Chip,
    Tooltip
} from "@material-ui/core";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Code as CodeIcon,
    FileCopy as CopyIcon
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import WebchatChannelModal from "../../components/WebchatChannelModal";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    customTableCell: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 4,
        marginRight: 8,
        border: "1px solid #ddd"
    },
    scriptDialog: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: "#1e1e1e",
        borderRadius: theme.shape.borderRadius,
        fontFamily: "monospace",
        fontSize: 12,
        color: "#d4d4d4",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        maxHeight: 200,
        overflow: "auto"
    }
}));

const reducer = (state, action) => {
    if (action.type === "LOAD_CHANNELS") {
        return [...action.payload];
    }
    if (action.type === "UPDATE_CHANNEL") {
        const channelIndex = state.findIndex((c) => c.id === action.payload.id);
        if (channelIndex !== -1) {
            state[channelIndex] = action.payload;
            return [...state];
        }
        return [action.payload, ...state];
    }
    if (action.type === "DELETE_CHANNEL") {
        return state.filter((c) => c.id !== action.payload);
    }
    return state;
};

const WebchatChannels = () => {
    const classes = useStyles();

    const [channels, dispatch] = useReducer(reducer, []);
    const [loading, setLoading] = useState(false);
    const [channelModalOpen, setChannelModalOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [scriptModalOpen, setScriptModalOpen] = useState(false);
    const [embedCode, setEmbedCode] = useState("");

    const fetchChannels = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/webchat-channels");
            dispatch({ type: "LOAD_CHANNELS", payload: data });
        } catch (err) {
            toast.error("Error loading webchat channels");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleOpenChannelModal = () => {
        setSelectedChannel(null);
        setChannelModalOpen(true);
    };

    const handleEditChannel = (channel) => {
        setSelectedChannel(channel);
        setChannelModalOpen(true);
    };

    const handleCloseChannelModal = () => {
        setSelectedChannel(null);
        setChannelModalOpen(false);
        fetchChannels();
    };

    const handleDeleteChannel = (channel) => {
        setSelectedChannel(channel);
        setConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/webchat-channels/${selectedChannel.id}`);
            dispatch({ type: "DELETE_CHANNEL", payload: selectedChannel.id });
            toast.success("Channel deleted successfully");
        } catch (err) {
            toast.error("Error deleting channel");
        }
        setConfirmModalOpen(false);
        setSelectedChannel(null);
    };

    const handleGetScript = async (channel) => {
        try {
            const { data } = await api.get(`/webchat-channels/${channel.id}/script`);
            setEmbedCode(data.embedCode);
            setScriptModalOpen(true);
        } catch (err) {
            toast.error("Error getting embed code");
        }
    };

    const handleCopyScript = () => {
        navigator.clipboard.writeText(embedCode);
        toast.success("Script copied to clipboard!");
        setScriptModalOpen(false);
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title="Delete Webchat Channel"
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
            >
                {i18n.t("webchatChannels.confirmDelete")}
            </ConfirmationModal>

            <WebchatChannelModal
                open={channelModalOpen}
                onClose={handleCloseChannelModal}
                channelId={selectedChannel?.id}
            />

            {/* Script Modal */}
            {scriptModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                }}>
                    <Paper style={{ padding: 24, maxWidth: 600, width: "90%" }}>
                        <Typography variant="h6" gutterBottom>
                            Embed Code
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Copy and paste this code into your website's HTML, right before the closing &lt;/body&gt; tag.
                        </Typography>
                        <div className={classes.scriptDialog}>
                            {embedCode}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                            <Button onClick={() => setScriptModalOpen(false)}>Cancel</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CopyIcon />}
                                onClick={handleCopyScript}
                            >
                                Copy Code
                            </Button>
                        </div>
                    </Paper>
                </div>
            )}

            <MainHeader>
                <Title>{i18n.t("webchatChannels.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenChannelModal}
                    >
                        <AddIcon style={{ marginRight: 8 }} />
                        {i18n.t("webchatChannels.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>

            <Paper className={classes.mainPaper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{i18n.t("webchatChannels.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("webchatChannels.table.color")}</TableCell>
                            <TableCell align="center">{i18n.t("webchatChannels.table.status")}</TableCell>
                            <TableCell align="center">{i18n.t("webchatChannels.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!loading && channels.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="textSecondary">
                                        {i18n.t("webchatChannels.noChannels")}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {channels.map((channel) => (
                            <TableRow key={channel.id}>
                                <TableCell>{channel.name}</TableCell>
                                <TableCell align="center">
                                    <div className={classes.customTableCell}>
                                        <div
                                            className={classes.colorPreview}
                                            style={{ backgroundColor: channel.primaryColor }}
                                        />
                                        {channel.primaryColor}
                                    </div>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={channel.isActive ? "Active" : "Inactive"}
                                        color={channel.isActive ? "primary" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Get Embed Code">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleGetScript(channel)}
                                        >
                                            <CodeIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditChannel(channel)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteChannel(channel)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default WebchatChannels;
