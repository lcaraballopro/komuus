import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

// Register Service Worker for PWA push notifications
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js')
			.then(registration => {
				console.log('[SW] Registered:', registration.scope);
			})
			.catch(error => {
				console.log('[SW] Registration failed:', error);
			});
	});
}

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root")
);

// ReactDOM.render(
// 	<React.StrictMode>
// 		<CssBaseline>
// 			<App />
// 		</CssBaseline>,
//   </React.StrictMode>

// 	document.getElementById("root")
// );
