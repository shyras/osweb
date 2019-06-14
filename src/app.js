/* This is the entry script for the webpack builder
This script ties all needed modules or files together and provides the
correct setting for the webpack-devserver
*/

import './scss/osweb.scss'
import osweb from './js/osweb/index.js'

if (typeof window !== 'undefined') {
  window.alertify = require('alertifyjs')
  require('alertifyjs/build/css/alertify.css')
  require('alertifyjs/build/css/themes/default.css')
  window.osweb = osweb
  window.osweb.printVersionInfo()
}

if (module.hot) {
  module.hot.accept()
}
