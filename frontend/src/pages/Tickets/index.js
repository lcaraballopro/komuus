import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";
import Hidden from "@material-ui/core/Hidden";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    backgroundColor: theme.palette.background.default,
  },

  chatPapper: {
    display: "flex",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
  },

  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
  },
  contactsWrapperSmall: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  messagessWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },
  welcomeMsg: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    borderRadius: 0,
    padding: theme.spacing(4),
  },
  welcomeIcon: {
    fontSize: 120,
    color: theme.palette.text.secondary,
    opacity: 0.15,
    marginBottom: theme.spacing(3),
  },
  welcomeText: {
    fontSize: "1.1rem",
    color: theme.palette.text.secondary,
    maxWidth: 320,
    lineHeight: 1.6,
  },
  ticketsManager: {},
  ticketsManagerClosed: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
          <Grid
            item
            xs={12}
            md={4}
            className={
              ticketId ? classes.contactsWrapperSmall : classes.contactsWrapper
            }
          >
            <TicketsManager />
          </Grid>
          <Grid item xs={12} md={8} className={classes.messagessWrapper}>
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg} elevation={0}>
                  <ChatBubbleOutlineIcon className={classes.welcomeIcon} />
                  <Typography className={classes.welcomeText}>
                    {i18n.t("chat.noTicketMessage")}
                  </Typography>
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;

