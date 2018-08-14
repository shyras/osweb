/* This is the entry script for the webpack builder
This script ties all needed modules or files together and provides the
correct setting for the webpack-devserver
*/

import 'bootstrap'
import './scss/osweb.scss'
import 'alertifyjs/build/css/alertify.css'
import 'alertifyjs/build/css/themes/bootstrap.css'

import osweb from './js/osweb/index.js'

if (typeof window !== 'undefined') {
  window.alertify = require('alertifyjs')
  window.alertify.defaults.theme.ok = 'btn btn-primary'
  window.alertify.defaults.theme.cancel = 'btn btn-light'
  window.alertify.defaults.theme.input = 'form-control'
  window.osweb = osweb
  window.osweb.printVersionInfo()
}

if (module.hot) {
  module.hot.accept()
}

if (process.env.NODE_ENV === 'development') {
  require('webpack-serve-overlay')
}
