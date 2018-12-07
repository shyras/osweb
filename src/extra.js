/** Extra assets to let included osweb demo page function properly */

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'alertifyjs/build/css/themes/bootstrap.css'

if (typeof window !== 'undefined') {
  window.alertify.defaults.theme.ok = 'btn btn-primary'
  window.alertify.defaults.theme.cancel = 'btn btn-light'
  window.alertify.defaults.theme.input = 'form-control'
}
