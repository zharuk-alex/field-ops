import { date } from 'quasar'

const formatTimestamp = (timestamp) => {
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')
}

const msToHumanTime = (ms) => {
  if (!ms || ms < 0) return '00:00:00'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )}:${String(seconds).padStart(2, '0')}`
}

const date_MD = (timestamp) => {
  if (timestamp > 0 && 'formatDate' in date) {
    return date.formatDate(timestamp, 'MMM D')
  }
}

const date_Hm = (timestamp) => {
  if (timestamp > 0 && 'formatDate' in date) {
    return date.formatDate(timestamp, 'HH:mm')
  }
}

const convertTimestampToArray = (timestamp) => {
  const date = new Date(timestamp)
  const optionsDate = { month: 'short', day: 'numeric' }
  const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false }

  const formattedDate = date.toLocaleDateString('uk-UA', optionsDate).replace('.', '')
  const formattedTime = date.toLocaleTimeString('uk-UA', optionsTime)

  return [formattedDate, formattedTime]
}

const msToTime = (duration) => {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor(duration / (1000 * 60 * 60))

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return hours + ':' + minutes + ':' + seconds
}

const daysBetweenDates = (toDate) => {
  const currentDate = new Date()
  const targetDate = new Date(toDate + 'T00:00:00')

  const difference = targetDate - currentDate
  const days = difference / (1000 * 60 * 60 * 24)

  return Math.abs(Math.ceil(days))
}

const isValidTimeFormat = (timeString) => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/
  return timeRegex.test(timeString)
}

const formatDateTime = (timestamp, format = 'YYYY-MM-DD HH:mm') => {
  if (!timestamp) return ''
  return date.formatDate(timestamp, format)
}

export {
  formatTimestamp,
  msToHumanTime,
  date_MD,
  date_Hm,
  convertTimestampToArray,
  msToTime,
  daysBetweenDates,
  isValidTimeFormat,
  formatDateTime,
}
