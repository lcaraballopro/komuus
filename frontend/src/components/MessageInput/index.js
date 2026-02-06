import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { useParams } from "react-router-dom";
import { Picker } from "emoji-mart";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoreVert from "@material-ui/icons/MoreVert";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import ClearIcon from "@material-ui/icons/Clear";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import {
  FormControlLabel,
  Hidden,
  Menu,
  MenuItem,
  Switch,
} from "@material-ui/core";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

let Mp3Recorder = null;

const initRecorder = async () => {
  if (!Mp3Recorder) {
    try {
      const MicRecorder = (await import("mic-recorder-to-mp3")).default;
      Mp3Recorder = new MicRecorder({ bitRate: 128 });
    } catch (error) {
      console.error("Failed to initialize recorder:", error);
      return null;
    }
  }
  return Mp3Recorder;
};

const useStyles = makeStyles(theme => ({
  mainWrapper: {
    background: "rgba(240, 242, 245, 0.95)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "8px 12px",
    borderRadius: 28,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 56,
      left: 0,
      right: 0,
      margin: "0 6px 6px 6px",
      borderRadius: 24,
      zIndex: 1000,
    },
  },

  newMessageBox: {
    background: "transparent",
    width: "100%",
    display: "flex",
    padding: "6px 6px 6px 12px",
    alignItems: "center",
    gap: 2,
  },

  messageInputWrapper: {
    padding: "4px 8px",
    background: "#ffffff",
    display: "flex",
    borderRadius: 24,
    flex: 1,
    position: "relative",
    alignItems: "center",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    minHeight: 44,
  },

  messageInput: {
    paddingLeft: 8,
    paddingRight: 8,
    flex: 1,
    border: "none",
    fontSize: 15,
    lineHeight: 1.4,
  },

  sendMessageIcons: {
    color: "#54656f",
    fontSize: 22,
  },

  actionIconButton: {
    padding: 6,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },

  sendButton: {
    backgroundColor: "#00a884",
    color: "#fff",
    padding: 8,
    marginLeft: 6,
    "&:hover": {
      backgroundColor: "#008f72",
    },
    "& svg": {
      fontSize: 20,
    },
  },

  micButton: {
    backgroundColor: "#00a884",
    color: "#fff",
    padding: 8,
    marginLeft: 6,
    "&:hover": {
      backgroundColor: "#008f72",
    },
    "& svg": {
      fontSize: 20,
    },
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(240, 242, 245, 0.95)",
    borderRadius: 28,
    margin: "8px 12px",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 56,
      left: 0,
      right: 0,
      margin: "0 6px 6px 6px",
      borderRadius: 24,
      zIndex: 1000,
    },
  },

  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },

  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: green[500],
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
    gap: 4,
  },

  cancelAudioIcon: {
    color: "#f44336",
  },

  sendAudioIcon: {
    color: "#00a884",
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 12,
    paddingRight: 12,
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
  messageQuickAnswersWrapper: {
    margin: 0,
    position: "absolute",
    bottom: "50px",
    background: "#ffffff",
    padding: "4px",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    left: 0,
    width: "100%",
    maxHeight: 200,
    overflowY: "auto",
    "& li": {
      listStyle: "none",
      "& a": {
        display: "block",
        padding: "10px 12px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "40px",
        borderRadius: 6,
        "&:hover": {
          background: "#f0f2f5",
          cursor: "pointer",
        },
      },
    },
  },
}));

const MessageInput = ({ ticketStatus }) => {
  const classes = useStyles();
  const { ticketId } = useParams();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  const handleChangeInput = e => {
    setInputMessage(e.target.value);
    handleLoadQuickAnswer(e.target.value);
  };

  const handleQuickAnswersClick = value => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = e => {
    let emoji = e.native;
    setInputMessage(prevState => prevState + emoji);
  };

  const handleChangeMedias = e => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = e => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async e => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach(media => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      const recorder = await initRecorder();
      if (!recorder) {
        throw new Error("Recorder not available");
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLoadQuickAnswer = async value => {
    if (value && value.indexOf("/") === 0) {
      try {
        const { data } = await api.get("/quickAnswers/", {
          params: { searchParam: inputMessage.substring(1) },
        });
        setQuickAnswer(data.quickAnswers);
        if (data.quickAnswers.length > 0) {
          setTypeBar(true);
        } else {
          setTypeBar(false);
        }
      } catch (err) {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const recorder = await initRecorder();
      if (!recorder) {
        throw new Error("Recorder not available");
      }
      const [, blob] = await recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      const recorder = await initRecorder();
      if (recorder) {
        await recorder.stop().getMp3();
      }
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = event => {
    setAnchorEl(null);
  };

  const renderReplyingMessage = message => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          <div className={classes.replyginMsgBody}>
            {!message.fromMe && (
              <span className={classes.messageContactName}>
                {message.contact?.name}
              </span>
            )}
            {message.body}
          </div>
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <ClearIcon className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={e => setMedias([])}
        >
          <CancelIcon className={classes.sendMessageIcons} />
        </IconButton>

        {loading ? (
          <div>
            <CircularProgress className={classes.circleLoading} />
          </div>
        ) : (
          <span>
            {medias[0]?.name}
            {/* <img src={media.preview} alt=""></img> */}
          </span>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
        >
          <SendIcon className={classes.sendMessageIcons} />
        </IconButton>
      </Paper>
    );
  else {
    return (
      <Paper square elevation={0} className={classes.mainWrapper}>
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <div className={classes.newMessageBox}>
          {/* Desktop: emoji, attach, and sign toggle outside */}
          <Hidden only={["sm", "xs"]}>
            <IconButton
              aria-label="emojiPicker"
              component="span"
              className={classes.actionIconButton}
              disabled={loading || recording || ticketStatus !== "open"}
              onClick={e => setShowEmoji(prevState => !prevState)}
            >
              <MoodIcon className={classes.sendMessageIcons} />
            </IconButton>
            {showEmoji ? (
              <div className={classes.emojiBox}>
                <ClickAwayListener onClickAway={e => setShowEmoji(false)}>
                  <Picker
                    perLine={16}
                    showPreview={false}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                  />
                </ClickAwayListener>
              </div>
            ) : null}

            <input
              multiple
              type="file"
              id="upload-button"
              disabled={loading || recording || ticketStatus !== "open"}
              className={classes.uploadInput}
              onChange={handleChangeMedias}
            />
            <label htmlFor="upload-button">
              <IconButton
                aria-label="upload"
                component="span"
                className={classes.actionIconButton}
                disabled={loading || recording || ticketStatus !== "open"}
              >
                <AttachFileIcon className={classes.sendMessageIcons} />
              </IconButton>
            </label>
            <FormControlLabel
              style={{ marginRight: 7, color: "#54656f", fontSize: 13 }}
              label={i18n.t("messagesInput.signMessage")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={signMessage}
                  onChange={e => {
                    setSignMessage(e.target.checked);
                  }}
                  name="showAllTickets"
                  color="primary"
                />
              }
            />
          </Hidden>

          {/* Input wrapper with icons inside for all sizes */}
          <div className={classes.messageInputWrapper}>
            {/* Mobile only: compact icons inside input */}
            <Hidden only={["md", "lg", "xl"]}>
              <IconButton
                aria-label="emojiPicker"
                component="span"
                size="small"
                style={{ padding: 6 }}
                disabled={loading || recording || ticketStatus !== "open"}
                onClick={e => setShowEmoji(prevState => !prevState)}
              >
                <MoodIcon style={{ fontSize: 20, color: "#54656f" }} />
              </IconButton>
              {showEmoji ? (
                <div className={classes.emojiBox}>
                  <ClickAwayListener onClickAway={e => setShowEmoji(false)}>
                    <Picker
                      perLine={8}
                      showPreview={false}
                      showSkinTones={false}
                      onSelect={handleAddEmoji}
                    />
                  </ClickAwayListener>
                </div>
              ) : null}
              <input
                multiple
                type="file"
                id="upload-button-mobile"
                disabled={loading || recording || ticketStatus !== "open"}
                className={classes.uploadInput}
                onChange={handleChangeMedias}
              />
              <label htmlFor="upload-button-mobile">
                <IconButton
                  aria-label="upload"
                  component="span"
                  size="small"
                  style={{ padding: 6 }}
                  disabled={loading || recording || ticketStatus !== "open"}
                >
                  <AttachFileIcon style={{ fontSize: 20, color: "#54656f" }} />
                </IconButton>
              </label>
            </Hidden>

            <InputBase
              inputRef={input => {
                input && input.focus();
                input && (inputRef.current = input);
              }}
              className={classes.messageInput}
              placeholder={
                ticketStatus === "open"
                  ? i18n.t("messagesInput.placeholderOpen")
                  : i18n.t("messagesInput.placeholderClosed")
              }
              multiline
              maxRows={5}
              value={inputMessage}
              onChange={handleChangeInput}
              disabled={recording || loading || ticketStatus !== "open"}
              onPaste={e => {
                ticketStatus === "open" && handleInputPaste(e);
              }}
              onKeyPress={e => {
                if (loading || e.shiftKey) return;
                else if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            {typeBar ? (
              <ul className={classes.messageQuickAnswersWrapper}>
                {quickAnswers.map((value, index) => {
                  return (
                    <li
                      className={classes.messageQuickAnswersWrapperItem}
                      key={index}
                    >
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a onClick={() => handleQuickAnswersClick(value.message)}>
                        {`${value.shortcut} - ${value.message}`}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {/* Action button: Send or Mic */}
          {inputMessage ? (
            <IconButton
              aria-label="sendMessage"
              component="span"
              className={classes.sendButton}
              onClick={handleSendMessage}
              disabled={loading}
            >
              <SendIcon />
            </IconButton>
          ) : recording ? (
            <div className={classes.recorderWrapper}>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                size="small"
                disabled={loading}
                onClick={handleCancelAudio}
              >
                <HighlightOffIcon className={classes.cancelAudioIcon} />
              </IconButton>
              {loading ? (
                <div>
                  <CircularProgress className={classes.audioLoading} />
                </div>
              ) : (
                <RecordingTimer />
              )}
              <IconButton
                aria-label="sendRecordedAudio"
                component="span"
                size="small"
                onClick={handleUploadAudio}
                disabled={loading}
              >
                <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
              </IconButton>
            </div>
          ) : (
            <IconButton
              aria-label="showRecorder"
              component="span"
              className={classes.micButton}
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
            >
              <MicIcon />
            </IconButton>
          )}
        </div>
      </Paper>
    );
  }
};

export default MessageInput;
