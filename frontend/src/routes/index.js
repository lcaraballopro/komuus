import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";
import AIAgents from "../pages/AIAgents/";
import Companies from "../pages/Companies/";
import Roles from "../pages/Roles/";
import ContactForms from "../pages/ContactForms/";
import Reports from "../pages/Reports/";

import CloseReasons from "../pages/CloseReasons/";
import Reservations from "../pages/Reservations/";
import Profile from "../pages/Profile/";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { ThemeProvider } from "../context/DarkMode";
// import { TelephonyProvider } from "../context/TelephonyContext";
import Route from "./Route";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <WhatsAppsProvider>
              {/* <TelephonyProvider> */}
              <LoggedInLayout>
                <Route exact path="/" component={Dashboard} isPrivate />
                <Route exact path="/tickets/:ticketId?" component={Tickets} isPrivate />
                <Route exact path="/connections" component={Connections} isPrivate />
                <Route exact path="/contacts" component={Contacts} isPrivate />
                <Route exact path="/users" component={Users} isPrivate />
                <Route exact path="/quickAnswers" component={QuickAnswers} isPrivate />
                <Route exact path="/Settings" component={Settings} isPrivate />
                <Route exact path="/Queues" component={Queues} isPrivate />
                <Route exact path="/ai-agents" component={AIAgents} isPrivate />
                <Route exact path="/companies" component={Companies} isPrivate />
                <Route exact path="/roles" component={Roles} isPrivate />
                <Route exact path="/contact-forms" component={ContactForms} isPrivate />
                <Route exact path="/reports" component={Reports} isPrivate />

                <Route exact path="/close-reasons" component={CloseReasons} isPrivate />
                <Route exact path="/reservations" component={Reservations} isPrivate />
                <Route exact path="/profile" component={Profile} isPrivate />
              </LoggedInLayout>
              {/* </TelephonyProvider> */}
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer autoClose={3000} />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;

