/* This is the entry script for the webpack builder 
This script ties all needed modules or files together and provides the
correct setting for the webpack-devserver
*/

import 'bootstrap';
import './scss/osweb.scss';
import './scss/alertify.min.css';
import './scss/alertify.theme.bootstrap.css';
import osweb from './js/osweb/index.js';

if (typeof window !== 'undefined') {
	window.alertify = require('alertifyjs');
	window.osweb = osweb;
	window.osweb.printVersionInfo();
}