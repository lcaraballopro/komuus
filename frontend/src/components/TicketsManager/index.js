import React, { useContext, useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import ChatIcon from "@material-ui/icons/Chat";
import ArchiveIcon from "@material-ui/icons/Archive";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },

  header: {
    padding: theme.spacing(2, 2, 1, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1.5, 1.5, 1, 1.5),
    },
  },

  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.25rem",
      marginBottom: theme.spacing(1),
    },
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      gap: theme.spacing(0.75),
      marginBottom: theme.spacing(0.75),
    },
  },

  searchWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
    borderRadius: 24,
    padding: theme.spacing(0.75, 2),
    transition: "all 0.2s ease",
    border: `1px solid transparent`,
    "&:focus-within": {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0.5, 1.5),
      borderRadius: 20,
    },
  },

  searchIcon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
    fontSize: 20,
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
      marginRight: theme.spacing(0.5),
    },
  },

  searchInput: {
    flex: 1,
    border: "none",
    fontSize: "0.95rem",
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.875rem",
    },
  },

  tabsContainer: {
    backgroundColor: theme.palette.background.paper,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
    },
  },

  tabs: {
    minHeight: 44,
    [theme.breakpoints.down("xs")]: {
      minHeight: 40,
    },
  },

  tab: {
    minWidth: "auto",
    minHeight: 44,
    padding: theme.spacing(0, 2),
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
    borderRadius: "12px 12px 0 0",
    transition: "all 0.2s ease",
    "&.Mui-selected": {
      backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    },
    [theme.breakpoints.down("xs")]: {
      minHeight: 40,
      padding: theme.spacing(0, 1.5),
      fontSize: "0.85rem",
      "& .MuiTab-wrapper": {
        flexDirection: "row",
        gap: 4,
      },
    },
  },

  tabBadge: {
    "& .MuiBadge-badge": {
      right: -12,
      top: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
    },
    [theme.breakpoints.down("xs")]: {
      "& .MuiBadge-badge": {
        right: -8,
        top: 6,
        fontSize: "0.65rem",
        minWidth: 18,
        height: 18,
      },
    },
  },

  optionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0.75, 1),
      gap: theme.spacing(0.5),
    },
  },

  switchLabel: {
    marginRight: 0,
    "& .MuiFormControlLabel-label": {
      fontSize: "0.85rem",
      fontWeight: 500,
    },
    [theme.breakpoints.down("xs")]: {
      "& .MuiFormControlLabel-label": {
        fontSize: "0.8rem",
      },
    },
  },

  subTabs: {
    minHeight: 40,
    "& .MuiTabs-indicator": {
      height: 3,
      borderRadius: "3px 3px 0 0",
    },
    [theme.breakpoints.down("xs")]: {
      minHeight: 36,
    },
  },

  subTab: {
    minWidth: "auto",
    minHeight: 40,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    [theme.breakpoints.down("xs")]: {
      minHeight: 36,
      fontSize: "0.8rem",
      padding: theme.spacing(0, 1),
    },
  },

  listContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  fab: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 10,
    boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)",
    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    "&:hover": {
      background: "linear-gradient(135deg, #1ebe5a 0%, #0f7a6e 100%)",
      transform: "scale(1.05)",
    },
    transition: "all 0.2s ease",
    [theme.breakpoints.down("xs")]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
      width: 52,
      height: 52,
    },
  },

  emptyStateIcon: {
    fontSize: 64,
    color: theme.palette.text.secondary,
    opacity: 0.3,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      fontSize: 48,
      marginBottom: theme.spacing(1.5),
    },
  },
}));

const TicketsManager = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current?.focus();
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      if (tab === "search") {
        setTab("open");
      }
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
      setTab("search");
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
    if (newValue !== "search") {
      setSearchParam("");
    }
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />

      {/* Header with title and search */}
      <div className={classes.header}>
        <Typography className={classes.headerTitle}>
          {i18n.t("mainDrawer.listItems.tickets")}
        </Typography>

        <div className={classes.searchContainer}>
          <div className={classes.searchWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              onChange={handleSearch}
            />
          </div>
          <TicketsQueueSelect
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={(values) => setSelectedQueueIds(values)}
          />
        </div>
      </div>

      {/* Main tabs */}
      <div className={classes.tabsContainer}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
        >
          <Tab
            value={"open"}
            icon={<ChatIcon style={{ fontSize: 18 }} />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<ArchiveIcon style={{ fontSize: 18 }} />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </div>

      {/* Options row */}
      <div className={classes.optionsRow}>
        <Can
          role={user.profile}
          perform="tickets-manager:showall"
          yes={() => (
            <FormControlLabel
              className={classes.switchLabel}
              label={i18n.t("tickets.buttons.showAll")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={showAllTickets}
                  onChange={() => setShowAllTickets((prevState) => !prevState)}
                  name="showAllTickets"
                  color="primary"
                />
              }
            />
          )}
          no={() => <div />}
        />

        {tab === "open" && (
          <Tabs
            value={tabOpen}
            onChange={handleChangeTabOpen}
            indicatorColor="primary"
            textColor="primary"
            className={classes.subTabs}
          >
            <Tab
              label={
                <Badge
                  className={classes.tabBadge}
                  badgeContent={openCount}
                  color="primary"
                >
                  {i18n.t("ticketsList.assignedHeader")}
                </Badge>
              }
              value={"open"}
              classes={{ root: classes.subTab }}
            />
            <Tab
              label={
                <Badge
                  className={classes.tabBadge}
                  badgeContent={pendingCount}
                  color="secondary"
                >
                  {i18n.t("ticketsList.pendingHeader")}
                </Badge>
              }
              value={"pending"}
              classes={{ root: classes.subTab }}
            />
          </Tabs>
        )}
      </div>

      {/* Content */}
      <TabPanel value={tab} name="open" className={classes.listContainer}>
        <TicketsList
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setOpenCount(val)}
          style={applyPanelStyle("open")}
        />
        <TicketsList
          status="pending"
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
          style={applyPanelStyle("pending")}
        />
      </TabPanel>

      <TabPanel value={tab} name="closed" className={classes.listContainer}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>

      <TabPanel value={tab} name="search" className={classes.listContainer}>
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>

      {/* Floating Action Button */}
      <Tooltip title={i18n.t("ticketsManager.buttons.newTicket")} placement="left">
        <Fab
          color="primary"
          className={classes.fab}
          onClick={() => setNewTicketModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Paper>
  );
};

export default TicketsManager;
