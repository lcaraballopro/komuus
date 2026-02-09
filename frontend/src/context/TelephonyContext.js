import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
// import { Web } from "sip.js"; 
import { toast } from "react-toastify";

export const TelephonyContext = createContext();

export const TelephonyProvider = ({ children }) => {
  const [user, setUser] = useState(null); // SimpleUser instance
  const [status, setStatus] = useState("disconnected"); // disconnected, connecting, registered, unregistered
  const [callStatus, setCallStatus] = useState("idle"); // idle, ringing, dialing, connected, holding
  const [remoteIdentity, setRemoteIdentity] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Audio references
  const remoteAudioRef = useRef(null);
  const ringtoneRef = useRef(null);

  // Configuration from localStorage (temporary until backend integration is complete for User settings)
  const [config, setConfig] = useState({
    server: localStorage.getItem("sipServer") || "",
    username: localStorage.getItem("sipUser") || "",
    password: localStorage.getItem("sipPassword") || "",
    port: localStorage.getItem("sipPort") || "443", // WSS port usually 443 or 8089
    protocol: localStorage.getItem("sipProtocol") || "wss" // wss or ws
  });

  const saveConfig = (newConfig) => {
    localStorage.setItem("sipServer", newConfig.server);
    localStorage.setItem("sipUser", newConfig.username);
    localStorage.setItem("sipPassword", newConfig.password);
    localStorage.setItem("sipPort", newConfig.port);
    localStorage.setItem("sipProtocol", newConfig.protocol);
    setConfig(newConfig);
  };

  const connect = useCallback(async () => {
    if (!config.server || !config.username || !config.password) {
      setErrorMessage("Faltan credenciales SIP");
      return;
    }

    try {
      setStatus("connecting");

      // MOCK CONNECTION
      setTimeout(() => {
        setStatus("registered");
        toast.success("Conectado (Mock)");
        setUser({ mock: true });
      }, 1000);

      /*
      const target = `sip:${config.username}@${config.server}`;
      const wsServer = `${config.protocol}://${config.server}:${config.port}/ws`;

      const options = {
          aor: target,
          media: {
              constraints: { audio: true, video: false },
              remote: { audio: remoteAudioRef.current }
          },
          userAgentOptions: {
              authorizationPassword: config.password,
              authorizationUsername: config.username,
              transportOptions: {
                  server: wsServer
              }
          }
      };

      const simpleUser = new Web.SimpleUser(wsServer, options);

      // Event handlers
      simpleUser.delegate = {
          onCallReceived: () => {
              setCallStatus("ringing");
              if (ringtoneRef.current) ringtoneRef.current.play();
          },
          onCallAnswered: () => {
              setCallStatus("connected");
              if (ringtoneRef.current) {
                  ringtoneRef.current.pause();
                  ringtoneRef.current.currentTime = 0;
              }
          },
          onCallHangup: () => {
              setCallStatus("idle");
              if (ringtoneRef.current) {
                  ringtoneRef.current.pause();
                  ringtoneRef.current.currentTime = 0;
              }
          },
          onRegistered: () => setStatus("registered"),
          onUnregistered: () => setStatus("unregistered"),
          onServerDisconnect: () => setStatus("disconnected"),
          onServerConnect: () => setStatus("connected_server") // before register
      };

      await simpleUser.connect();
      await simpleUser.register();
      setUser(simpleUser);
      */

    } catch (err) {
      console.error("SIP Connection Error:", err);
      setStatus("error");
      setErrorMessage(err.message);
      toast.error(`Error SIP: ${err.message}`);
    }
  }, [config]);

  const disconnect = useCallback(async () => {
    if (user) {
      // await user.unregister();
      // await user.disconnect();
      setUser(null);
      setStatus("disconnected");
    }
  }, [user]);

  const call = async (destination) => {
    if (!user || status !== "registered") {
      toast.error("No conectado al servidor SIP");
      return;
    }
    try {
      setCallStatus("dialing");
      setRemoteIdentity(destination);
      // await user.call(`sip:${destination}@${config.server}`);

      // Mock Call
      setTimeout(() => {
        setCallStatus("connected");
      }, 2000);

    } catch (err) {
      console.error("Call Error:", err);
      setCallStatus("idle");
      toast.error("Error al llamar");
    }
  };

  const answer = async () => {
    if (user) {
      // await user.answer();
      setCallStatus("connected");
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
  };

  const hangup = async () => {
    if (user) {
      // await user.hangup();
      setCallStatus("idle");
    }
  };

  const sendDTMF = (tone) => {
    if (user) {
      // user.sendDTMF(tone);
      console.log("DTMF:", tone);
    }
  };

  return (
    <TelephonyContext.Provider
      value={{
        user,
        status,
        callStatus,
        remoteIdentity,
        errorMessage,
        config,
        saveConfig,
        connect,
        disconnect,
        call,
        answer,
        hangup,
        sendDTMF,
        remoteAudioRef
      }}
    >
      <audio ref={remoteAudioRef} autoPlay />
      <audio ref={ringtoneRef} src="/assets/ringtone.mp3" loop />
      {children}
    </TelephonyContext.Provider>
  );
};
