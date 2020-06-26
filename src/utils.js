import $axios from 'axios'
import { Notify } from 'quasar'

export default {
  sortToLabelDate (sortString) {
    const dateTime = sortString.split(' ')
    dateTime[0] = dateTime[0].split('-').reverse().join('.')
    return dateTime.join(' ')
  },
  labelToSortDate (labelString) {
    const dateTime = labelString.split(' ')
    dateTime[0] = dateTime[0].split('.').reverse().join('-')
    return dateTime.join(' ')
  },
  sortDateToSeconds (ddddmmyymmss) {
    return new Date(ddddmmyymmss).getTime() / 1000
  },
  todayInSeconds () {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date / 1000
  },
  nowInSeconds () {
    return Math.floor(new Date() / 1000)
  },
  formatNumber (number) {
    if (this.isNumeric(number)) {
      return number.toLocaleString('de-ch')
    }
    return number
  },
  loadCSV (path, callback) { // { path: '', callback: (data) => {}}
    $axios.get(path)
      .then((response) => {
        const lines = response.data.split('\n')
        const headers = lines[0].split(',')
        for (let i = 0; i < headers.length; i++) {
          headers[i] = headers[i].replace(/(^")|("$)/g, '')
        }

        // skip first header line and loop recursive
        const array = []
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] !== '') {
            const line = lines[i].split(',')
            const obj = {}
            for (let e = 0; e < line.length; e++) {
              obj[headers[e]] = line[e].replace(/(^")|("$)/g, '')
            }
            array.push(obj)
          }
        }
        callback(array)
      })
      .catch(() => {
        if (path.includes('https://raw.githubusercontent.com')) {
          const githack = path.replace('https://raw.githubusercontent.com', 'https://raw.githack.com/')
          Notify.create({
            type: 'info',
            color: 'primary',
            position: 'top-right',
            message: 'redirect over raw.githack.com'
          })
          this.loadCSV(githack, callback)
        } else {
          Notify.create({
            type: 'negative',
            position: 'top-right',
            message: 'The file could not be loaded. Neither from raw.githubusercontent.com nor from raw.githack.com'
          })
        }
      })
  }
}
