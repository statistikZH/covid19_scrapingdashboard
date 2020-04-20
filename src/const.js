import { colors } from 'quasar'
const { lighten } = colors
import 'url-search-params-polyfill'

// get variables
const urlParams = new URLSearchParams(window.location.search)
const c1 = urlParams.get('c1') // entry point of data
const c2 = urlParams.get('c2') // hide top menu
const c3 = urlParams.get('c3') // remove logo and foother bar

// default primary color (zh blue) and lighten
let color1 = '#4d9221'
let color2 = '#b8e186'
let color3 = '#de77ae'

// color override
if (c1) {
  color1 = lighten(c1, 0)
}
if (c2) {
  color2 = lighten(c2, 0)
}
if (c3) {
  color3 = lighten(c3, 0)
}

export default {
  COLOR1: color1,
  COLOR2: color2,
  COLOR3: color3
}
