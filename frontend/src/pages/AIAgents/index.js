import React, { useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";
import {
    Button,
    IconButton,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
} from "@material-ui/core";
import { DeleteOutline, Edit, Android } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import AIAgentModal from "../../components/AIAgentModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    chip: {
        marginRight: theme.spacing(1),
    },
}));

const reducer = (state, action) => {
    if (action.type === "LOAD_AGENTS") {
        return action.payload;
    }
    if (action.type === "UPDATE_AGENT") {
        const agent = action.payload;
        const agentIndex = state.findIndex((a) => a.id === agent.id);
        if (agentIndex !== -1) {
            state[agentIndex] = agent;
            return [...state];
        } else {
            return [agent, ...state];
        }
    }
    if (action.type === "DELETE_AGENT") {
        const agentId = action.payload;
        return state.filter((a) => a.id !== agentId);
    }
    if (action.type === "RESET") {
        return [];
    }
    return state;
};

const AIAgents = () => {
    const classes = useStyles();
    const [agents, dispatch] = useReducer(reducer, []);
    const [loading, setLoading] = useState(false);
    const [agentModalOpen, setAgentModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/ai-agents");
                dispatch({ type: "LOAD_AGENTS", payload: data.agents });
                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        const socket = openSocket();
        socket.on("aiAgent", (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_AGENT", payload: data.agent });
            }
            if (data.action === "delete") {
                dispatch({ type: "DELETE_AGENT", payload: data.agentId });
            }
        });
        return () => socket.disconnect();
    }, []);

    const handleOpenAgentModal = () => {
        setAgentModalOpen(true);
        setSelectedAgent(null);
    };

    const handleCloseAgentModal = () => {
        setAgentModalOpen(false);
        setSelectedAgent(null);
    };

    const handleEditAgent = (agent) => {
        setSelectedAgent(agent);
        setAgentModalOpen(true);
    };

    const handleDeleteAgent = async (agentId) => {
        try {
            await api.delete(`/ai-agents/${agentId}`);
            toast.success(i18n.t("aiAgents.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setSelectedAgent(null);
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={selectedAgent && `${i18n.t("aiAgents.confirmationModal.deleteTitle")} ${selectedAgent.name}?`}
                open={confirmModalOpen}
                onClose={() => { setConfirmModalOpen(false); setSelectedAgent(null); }}
                onConfirm={() => handleDeleteAgent(selectedAgent.id)}
            >
                {i18n.t("aiAgents.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <AIAgentModal
                open={agentModalOpen}
                onClose={handleCloseAgentModal}
                agentId={selectedAgent?.id}
            />
            <MainHeader>
                <Title>{i18n.t("aiAgents.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button variant="contained" color="primary" onClick={handleOpenAgentModal}>
                        {i18n.t("aiAgents.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{i18n.t("aiAgents.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("aiAgents.table.webhookUrl")}</TableCell>
                            <TableCell align="center">{i18n.t("aiAgents.table.status")}</TableCell>
                            <TableCell align="center">{i18n.t("aiAgents.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {agents.map((agent) => (
                            <TableRow key={agent.id}>
                                <TableCell align="center">
                                    <Android style={{ marginRight: 8, verticalAlign: "middle" }} />
                                    {agent.name}
                                </TableCell>
                                <TableCell align="center" style={{ maxWidth: 200 }}>
                                    <span style={{ fontSize: 12 }}>{agent.webhookUrl?.substring(0, 40)}...</span>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={agent.isActive ? i18n.t("aiAgents.status.active") : i18n.t("aiAgents.status.inactive")}
                                        color={agent.isActive ? "primary" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleEditAgent(agent)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => { setSelectedAgent(agent); setConfirmModalOpen(true); }}>
                                        <DeleteOutline />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {loading && <TableRowSkeleton columns={4} />}
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default AIAgents;
