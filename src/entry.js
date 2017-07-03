/* This is the entry script for the webpack builder 
This script ties all needed modules or files together and provides the
correct setting for the webpack-devserver
*/

if (process.env.NODE_ENV === 'devserver') {
	// A bit stupid, but to enable hot module reloading for the HTML file, we need
	// to import it here.
	require('raw-loader!./html/index.ejs');
	// Accept hot module reloading
	if (module.hot) {
		module.hot.accept()
	}
}

import 'bootstrap/dist/css/bootstrap.css';
import './scss/osweb.scss';
import './scss/alertify.min.css';
import './scss/alertify.theme.bootstrap.css';
import osweb from './js/osweb/index.js';

if (typeof window !== 'undefined') {
	window.alertify = require('alertifyjs');
	window.osweb = osweb;
	window.osweb.printVersionInfo();
}