import React, { useState, useContext, useEffect, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  makeStyles,
  Typography,
  MenuItem,
  IconButton,
  Menu,
  Switch,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
} from "@material-ui/core";
import PhoneIcon from "@material-ui/icons/Phone";
import PhoneInTalkIcon from "@material-ui/icons/PhoneInTalk";
import PhoneMissedIcon from "@material-ui/icons/PhoneMissed";

import AccountCircle from "@material-ui/icons/AccountCircle";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AppsIcon from "@material-ui/icons/Apps";
import BusinessIcon from "@material-ui/icons/Business";
import SecurityIcon from "@material-ui/icons/Security";
import AssignmentIcon from "@material-ui/icons/Assignment";
import BarChartIcon from "@material-ui/icons/BarChart";
import CategoryIcon from "@material-ui/icons/Category";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import EventNoteIcon from "@material-ui/icons/EventNote";
import SettingsInputAntennaIcon from "@material-ui/icons/SettingsInputAntenna";
import BuildIcon from "@material-ui/icons/Build";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import NotificationsPopOver from "../components/NotificationsPopOver";
import ToastNotificationContainer from "../components/ToastNotification";

import TopToolbar from "../components/TopToolbar";
import NotificationDrawer from "../components/NotificationDrawer";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import { useThemeContext } from "../context/DarkMode";
import { Can } from "../components/Can";

// import { TelephonyContext } from "../context/TelephonyContext";
// import Softphone from "../components/Telephony/Softphone";

const taskbarHeight = 56;
const mobileTaskbarHeight = 64;
const topToolbarHeight = 52;
const mobileTopToolbarHeight = 48;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflow: "auto",
    paddingTop: topToolbarHeight,
    paddingBottom: taskbarHeight,
    [theme.breakpoints.down("sm")]: {
      paddingTop: mobileTopToolbarHeight,
      paddingBottom: mobileTaskbarHeight,
    },
  },
  taskbar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: taskbarHeight,
    backgroundColor: theme.palette.type === "dark" ? "#1e1e2d" : "#f8f9fa",
    borderTop: `1px solid ${theme.palette.type === "dark" ? "#2d2d3d" : "#e0e0e0"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: theme.zIndex.drawer + 2,
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
    [theme.breakpoints.down("sm")]: {
      height: mobileTaskbarHeight,
      justifyContent: "space-between",
      padding: theme.spacing(0, 1),
    },
  },
  taskbarContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down("sm")]: {
      flex: 1,
      justifyContent: "space-around",
      padding: 0,
      gap: 0,
    },
  },
  // Desktop button styles
  taskbarButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1, 1.5),
    borderRadius: 8,
    minWidth: 64,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#2d2d3d" : "#e8e8e8",
      color: theme.palette.primary.main,
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "auto",
      padding: theme.spacing(1),
      borderRadius: 12,
    },
  },
  taskbarButtonActive: {
    backgroundColor: theme.palette.type === "dark" ? "#3f51b5" : "#e3f2fd",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#3f51b5" : "#e3f2fd",
    },
  },
  taskbarIcon: {
    fontSize: 22,
    marginBottom: 2,
    [theme.breakpoints.down("sm")]: {
      fontSize: 24,
      marginBottom: 4,
    },
  },
  taskbarLabel: {
    fontSize: 10,
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1.2,
    [theme.breakpoints.down("sm")]: {
      fontSize: 9,
      maxWidth: 56,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: theme.palette.type === "dark" ? "#3d3d4d" : "#ddd",
    margin: theme.spacing(0, 1),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  rightSection: {
    position: "absolute",
    right: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      position: "static",
      gap: 0,
    },
  },
  systemIcon: {
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#2d2d3d" : "#e8e8e8",
    },
  },
  themeSwitchContainer: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  switch: {
    transform: "scale(0.7)",
  },
  themeIcon: {
    color: theme.palette.text.secondary,
    fontSize: 20,
  },
  // Popover group styles
  groupButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1, 1.5),
    borderRadius: 8,
    minWidth: 64,
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#2d2d3d" : "#e8e8e8",
      color: theme.palette.primary.main,
    },
  },
  groupButtonActive: {
    color: theme.palette.primary.main,
  },
  groupButtonOpen: {
    backgroundColor: theme.palette.type === "dark" ? "#2d2d3d" : "#e8e8e8",
    color: theme.palette.primary.main,
  },
  groupLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  groupExpandIcon: {
    fontSize: 14,
    transition: "transform 0.2s ease",
  },
  groupExpandIconOpen: {
    transform: "rotate(180deg)",
  },
  popoverPaper: {
    borderRadius: 12,
    minWidth: 200,
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    backgroundColor: theme.palette.type === "dark" ? "#1e1e2d" : "#ffffff",
    border: `1px solid ${theme.palette.type === "dark" ? "#2d2d3d" : "#e0e0e0"}`,
    padding: theme.spacing(1),
  },
  popoverItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 1.5),
    borderRadius: 8,
    cursor: "pointer",
    textDecoration: "none",
    color: theme.palette.text.primary,
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#2d2d3d" : "#f5f5f5",
    },
  },
  popoverItemActive: {
    backgroundColor: theme.palette.type === "dark" ? "#3f51b5" : "#e3f2fd",
    color: theme.palette.primary.main,
  },
  popoverItemIcon: {
    fontSize: 20,
    color: "inherit",
    minWidth: "auto",
  },
  popoverItemLabel: {
    fontSize: 13,
    fontWeight: 500,
  },
  // Mobile menu drawer
  mobileMenuDrawer: {
    "& .MuiDrawer-paper": {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "70vh",
    },
  },
  mobileMenuList: {
    padding: theme.spacing(2),
  },
  mobileMenuItem: {
    borderRadius: 12,
    marginBottom: theme.spacing(0.5),
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#2d2d3d" : "#f5f5f5",
    },
  },
  mobileMenuItemActive: {
    backgroundColor: theme.palette.type === "dark" ? "#3f51b5" : "#e3f2fd",
    color: theme.palette.primary.main,
  },
  mobileMenuHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  // Hidden on mobile classes
  hideOnMobile: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  hideOnDesktop: {
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  moreButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
    borderRadius: 12,
    cursor: "pointer",
    color: theme.palette.text.secondary,
  },
}));

const TaskbarButton = ({ to, icon: Icon, label, active, onClick, badge, hideLabel }) => {
  const classes = useStyles();

  const content = (
    <div
      className={`${classes.taskbarButton} ${active ? classes.taskbarButtonActive : ""}`}
      onClick={onClick}
    >
      {badge ? (
        <Badge badgeContent={badge} color="error">
          <Icon className={classes.taskbarIcon} />
        </Badge>
      ) : (
        <Icon className={classes.taskbarIcon} />
      )}
      {!hideLabel && <span className={classes.taskbarLabel}>{label}</span>}
    </div>
  );

  if (to) {
    return (
      <RouterLink to={to} style={{ textDecoration: "none" }}>
        {content}
      </RouterLink>
    );
  }

  return content;
};

const TaskbarGroupButton = ({ icon: Icon, label, items, isActive: isActiveFn }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const hasActiveChild = items.some((item) => isActiveFn(item.to));

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div
        className={`${classes.groupButton} ${hasActiveChild ? classes.groupButtonActive : ""} ${open ? classes.groupButtonOpen : ""}`}
        onClick={handleOpen}
      >
        <Icon className={classes.taskbarIcon} />
        <div className={classes.groupLabelRow}>
          <span className={classes.taskbarLabel}>{label}</span>
          <ExpandMoreIcon className={`${classes.groupExpandIcon} ${open ? classes.groupExpandIconOpen : ""}`} />
        </div>
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          className: classes.popoverPaper,
        }}
      >
        {items.map((item) => (
          <RouterLink
            key={item.to}
            to={item.to}
            style={{ textDecoration: "none" }}
            onClick={handleClose}
          >
            <div className={`${classes.popoverItem} ${isActiveFn(item.to) ? classes.popoverItemActive : ""}`}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  <item.icon className={classes.popoverItemIcon} />
                </Badge>
              ) : (
                <item.icon className={classes.popoverItemIcon} />
              )}
              <span className={classes.popoverItemLabel}>{item.label}</span>
            </div>
          </RouterLink>
        ))}
      </Popover>
    </>
  );
};

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);
  const { darkMode, toggleTheme } = useThemeContext();
  const [connectionWarning, setConnectionWarning] = useState(false);

  // const { status: sipStatus, callStatus: sipCallStatus } = useContext(TelephonyContext);
  const sipStatus = "disconnected";
  const sipCallStatus = "idle";
  const [softphoneAnchorEl, setSoftphoneAnchorEl] = useState(null);
  const softphoneId = "softphone-popover";

  const handleSoftphoneClick = (event) => {
    setSoftphoneAnchorEl(event.currentTarget);
  };

  const handleSoftphoneClose = () => {
    setSoftphoneAnchorEl(null);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };



  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };



  if (loading) {
    return <BackdropLoading />;
  }

  // Direct navigation items (always visible as single buttons)
  const directNavItems = [
    { to: "/", icon: DashboardOutlinedIcon, label: "Dashboard" },
    { to: "/tickets", icon: WhatsAppIcon, label: i18n.t("mainDrawer.listItems.tickets") },
    { to: "/contacts", icon: ContactPhoneOutlinedIcon, label: i18n.t("mainDrawer.listItems.contacts") },
  ];

  // Direct accounts button (replaces old channelsGroup)
  const accountsItem = { to: "/connections", icon: SyncAltIcon, label: i18n.t("mainDrawer.listItems.connections"), badge: connectionWarning ? "!" : null };

  const managementGroup = {
    icon: AssignmentIcon,
    label: "Gestión",
    items: [
      { to: "/quickAnswers", icon: QuestionAnswerOutlinedIcon, label: i18n.t("mainDrawer.listItems.quickAnswers") },
      { to: "/contact-forms", icon: AssignmentIcon, label: i18n.t("mainDrawer.listItems.contactForms") },
      { to: "/reservations", icon: EventNoteIcon, label: i18n.t("mainDrawer.listItems.reservations") },
      { to: "/close-reasons", icon: CategoryIcon, label: i18n.t("mainDrawer.listItems.closeReasons") },
    ],
  };

  const reportsItem = { to: "/reports", icon: BarChartIcon, label: i18n.t("reports.title") };

  const adminGroup = {
    icon: BuildIcon,
    label: "Admin",
    items: [
      { to: "/users", icon: PeopleAltOutlinedIcon, label: i18n.t("mainDrawer.listItems.users") },
      { to: "/queues", icon: AccountTreeOutlinedIcon, label: i18n.t("mainDrawer.listItems.queues") },
      { to: "/ai-agents", icon: AppsIcon, label: i18n.t("mainDrawer.listItems.aiAgents") },
      { to: "/settings", icon: SettingsOutlinedIcon, label: i18n.t("mainDrawer.listItems.settings") },
    ],
  };

  const systemGroup = {
    icon: BusinessIcon,
    label: "Sistema",
    items: [
      { to: "/companies", icon: BusinessIcon, label: i18n.t("companies.title") },
      { to: "/roles", icon: SecurityIcon, label: i18n.t("roles.title") },
    ],
  };

  // Flat arrays for mobile drawer (keep original structure)
  const secondaryNavItems = [
    { to: "/connections", icon: SyncAltIcon, label: i18n.t("mainDrawer.listItems.connections"), badge: connectionWarning ? "!" : null },
    { to: "/quickAnswers", icon: QuestionAnswerOutlinedIcon, label: i18n.t("mainDrawer.listItems.quickAnswers") },
    { to: "/contact-forms", icon: AssignmentIcon, label: i18n.t("mainDrawer.listItems.contactForms") },
    { to: "/reservations", icon: EventNoteIcon, label: i18n.t("mainDrawer.listItems.reservations") },
  ];

  const adminNavItems = [
    { to: "/users", icon: PeopleAltOutlinedIcon, label: i18n.t("mainDrawer.listItems.users") },
    { to: "/queues", icon: AccountTreeOutlinedIcon, label: i18n.t("mainDrawer.listItems.queues") },
    { to: "/close-reasons", icon: CategoryIcon, label: i18n.t("mainDrawer.listItems.closeReasons") },
    { to: "/ai-agents", icon: AppsIcon, label: i18n.t("mainDrawer.listItems.aiAgents") },
    { to: "/reports", icon: BarChartIcon, label: i18n.t("reports.title") },
    { to: "/settings", icon: SettingsOutlinedIcon, label: i18n.t("mainDrawer.listItems.settings") },
  ];

  return (
    <div className={classes.root}>

      <ToastNotificationContainer />

      {/* Top Toolbar */}
      <TopToolbar />

      {/* Mobile Notification Drawer (swipe-down) */}
      {isMobile && <NotificationDrawer />}

      <main className={classes.content}>
        {children ? children : null}
      </main>

      {/* Windows-style Taskbar */}
      <div className={classes.taskbar}>
        <div className={classes.taskbarContent}>
          {/* Direct nav items - always visible */}
          {directNavItems.map((item) => (
            <TaskbarButton
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={isActive(item.to)}
            />
          ))}

          {/* Desktop: grouped popover menus */}
          {!isMobile && (
            <>
              <div className={classes.divider} />
              <TaskbarButton
                to={accountsItem.to}
                icon={accountsItem.icon}
                label={accountsItem.label}
                active={isActive(accountsItem.to)}
                badge={accountsItem.badge}
              />
              <TaskbarGroupButton
                icon={managementGroup.icon}
                label={managementGroup.label}
                items={managementGroup.items}
                isActive={isActive}
              />
              <TaskbarButton
                to={reportsItem.to}
                icon={reportsItem.icon}
                label={reportsItem.label}
                active={isActive(reportsItem.to)}
              />
            </>
          )}

          {/* Admin group - desktop only, permission-gated */}
          {!isMobile && (
            <Can
              role={user.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <>
                  <div className={classes.divider} />
                  <TaskbarGroupButton
                    icon={adminGroup.icon}
                    label={adminGroup.label}
                    items={adminGroup.items}
                    isActive={isActive}
                  />
                  {/* Superadmin-only system group */}
                  {user.profile === "superadmin" && (
                    <TaskbarGroupButton
                      icon={systemGroup.icon}
                      label={systemGroup.label}
                      items={systemGroup.items}
                      isActive={isActive}
                    />
                  )}
                </>
              )}
            />
          )}

          {/* Mobile: More button to open menu */}
          {isMobile && (
            <div
              className={classes.moreButton}
              onClick={() => setMobileMenuOpen(true)}
            >
              <AppsIcon className={classes.taskbarIcon} />
              <span className={classes.taskbarLabel}>Más</span>
            </div>
          )}
        </div>

        {/* Right section - system icons */}
        <div className={classes.rightSection}>
          <div className={classes.themeSwitchContainer}>
            <Brightness4Icon className={classes.themeIcon} />
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              color="default"
              className={classes.switch}
              size="small"
            />
          </div>

          {user.id && !isMobile && (
            <NotificationsPopOver className={classes.systemIcon} />
          )}


          <IconButton
            edge="end"
            aria-label="softphone"
            aria-controls={softphoneId}
            aria-haspopup="true"
            onClick={handleSoftphoneClick}
            color="inherit"
          >
            <Badge
              overlap="circle"
              badgeContent=" "
              variant="dot"
              color={sipStatus === "registered" ? "secondary" : "error"}
              invisible={sipStatus === "disconnected"}
            >
              {sipCallStatus === "connected" ? <PhoneInTalkIcon /> : <PhoneIcon />}
            </Badge>
          </IconButton>

          <Tooltip title={user.name || "Usuario"}>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              className={classes.systemIcon}
              size="small"
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            open={menuOpen}
            onClose={handleCloseMenu}
          >
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleCloseMenu}
            >
              {i18n.t("mainDrawer.appBar.user.profile")}
            </MenuItem>
            <MenuItem onClick={handleClickLogout}>
              {i18n.t("mainDrawer.appBar.user.logout")}
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        className={classes.mobileMenuDrawer}
      >
        <div className={classes.mobileMenuHeader}>
          <Typography variant="h6">Menú</Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Brightness4Icon style={{ marginRight: 8, fontSize: 20 }} />
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              color="default"
              size="small"
            />
          </div>
        </div>
        <List className={classes.mobileMenuList}>
          {/* Secondary items */}
          {secondaryNavItems.map((item) => (
            <ListItem
              key={item.to}
              button
              component={RouterLink}
              to={item.to}
              onClick={handleMobileMenuClose}
              className={`${classes.mobileMenuItem} ${isActive(item.to) ? classes.mobileMenuItemActive : ""}`}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <item.icon />
                  </Badge>
                ) : (
                  <item.icon />
                )}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}

          {/* Admin items */}
          <Can
            role={user.profile}
            perform="drawer-admin-items:view"
            yes={() => (
              <>
                <Typography
                  variant="caption"
                  style={{
                    display: "block",
                    padding: "16px 16px 8px",
                    color: "#888",
                    fontWeight: 600,
                  }}
                >
                  {i18n.t("mainDrawer.listItems.administration")}
                </Typography>
                {adminNavItems.map((item) => (
                  <ListItem
                    key={item.to}
                    button
                    component={RouterLink}
                    to={item.to}
                    onClick={handleMobileMenuClose}
                    className={`${classes.mobileMenuItem} ${isActive(item.to) ? classes.mobileMenuItemActive : ""}`}
                  >
                    <ListItemIcon>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </>
            )}
          />

          {/* Notifications on mobile */}
          {user.id && (
            <ListItem
              button
              className={classes.mobileMenuItem}
            >
              <ListItemIcon>
                <NotificationsPopOver />
              </ListItemIcon>
              <ListItemText primary="Notificaciones" />
            </ListItem>
          )}
        </List>
      </Drawer>
      {/* <Popover
        id={softphoneId}
        open={Boolean(softphoneAnchorEl)}
        anchorEl={softphoneAnchorEl}
        onClose={handleSoftphoneClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Softphone />
      </Popover> */}
    </div >
  );
};

export default LoggedInLayout;
