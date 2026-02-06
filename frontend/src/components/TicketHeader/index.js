import React from "react";

import { Card, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    backgroundColor: "#fff",
    flex: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    padding: "4px 0",
    minHeight: 56,
    [theme.breakpoints.down("sm")]: {
      minHeight: 48,
      padding: "2px 0",
    },
  },
  backButton: {
    minWidth: 36,
    padding: "6px 8px",
    [theme.breakpoints.down("sm")]: {
      minWidth: 32,
      padding: "4px 6px",
    },
  },
}));

const TicketHeader = ({ loading, children }) => {
  const classes = useStyles();
  const history = useHistory();
  const handleBack = () => {
    history.push("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          <Button
            color="primary"
            onClick={handleBack}
            className={classes.backButton}
          >
            <ArrowBackIos style={{ fontSize: 18 }} />
          </Button>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
