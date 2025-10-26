import { is } from 'quasar'

const capitalizeStr = (str) => {
  const firstChar = str.charAt(0).toUpperCase()
  const remainingChars = str.slice(1)
  return firstChar + remainingChars
}

const distanceFormatter = (distMeters) => {
  let formatedDist = null

  if (is.number(distMeters) && distMeters > 1000) {
    formatedDist = (distMeters / 1000).toFixed(2) + ' km'
  } else if (is.number(distMeters) && distMeters < 1000) {
    formatedDist = distMeters.toFixed() + ' m'
  }

  return formatedDist
}

const hasValue = (val) => {
  return val != undefined && val != null && val != ''
}

export { capitalizeStr, distanceFormatter, hasValue }
