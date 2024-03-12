import { DateTime, FixedOffsetZone } from "luxon"
import timezoneLocale from "../timezones"
import { User } from "@prisma/client"

export type TimeStructure = {
  hour: string
  minute: string
  meridiem?: string
  zone: string | null
}

// Returns a list of structured data from a message (string)
export function analyzeText(str: string) {
  const matcher =
    /(\d{1,2}(:?\d{2})?\s?([ap]m)?)\s*((utc[+-]\d+)|([a-z]{3})?)/gm
  const timeMatches = str.toLowerCase().match(matcher)
  const structuredTimes: TimeStructure[] = []
  if (timeMatches?.length) {
    timeMatches.forEach((match) => {
      const splitMatch = match.split(" ") // Separates timezone and time if tz exists
      const hoursMinutes = splitMatch[0]
      const timeNumbers = hoursMinutes.match(/([0-9])+/g)
      let hour: string = ""
      let minute: string = ""
      if (timeNumbers?.length) {
        // handle for things like 1130am
        if (timeNumbers[0].length > 2 && timeNumbers[0].length < 5) {
          minute = timeNumbers[0].slice(timeNumbers[0].length - 2)
          hour = timeNumbers[0].slice(0, 2)
        } else {
          hour = timeNumbers[0]
        }
        if (timeNumbers.length > 1) {
          minute = timeNumbers[1]
        }
        if (!minute) {
          minute = "00"
        }
      }
      if (!validateTimeNumbers(hour, minute)) {
        if (process.env.DEV_MODE) {
          console.log("this is not a valid time", hour, minute)
        }
        return
      }
      let meridiem: string = ""
      const meridiemMatch = match.match(/([ap]m)/gi)
      if (meridiemMatch) {
        meridiem = meridiemMatch[0]
      }
      const zone = getZoneFromText(match)
      if (!hour || !minute) {
        console.error("Missing time data: ", hour, minute, zone)
        return
      }
      const newTime = {
        hour,
        minute,
        meridiem,
        zone,
      }
      structuredTimes.push(newTime)
    })
    return structuredTimes
  }
}

interface IntTime {
  hour: number
  minute?: number
}

// Checks if the hours / minutes fit within a plausible time (24hr)
function validateTimeNumbers(hour: string, minute?: string) {
  const intTime: IntTime = <IntTime>{}
  intTime.hour = parseInt(hour)
  if (minute) {
    intTime.minute = parseInt(minute)
    if (intTime.minute > 60) return false
  }
  if (intTime.hour > 24) return false
  return true
}

function isUTCtimezone(str: string) {
  const utcStamp = str.match(/([Uu][Tt][Cc][+-]\d+)/gm)
  return !!utcStamp
}

function getZoneFromText(str: string) {
  let s = str.split(" ")
  let zone: string | null = null
  let tzAbbrev: string = ""

  if (s[s.length - 1].toLowerCase().match(/(utc[+-]\d+)/gm)) {
    zone = `${s[s.length - 1].toUpperCase()}`
  }

  if (s.length > 1 && s[s.length - 1].toLowerCase() in timezoneLocale) {
    tzAbbrev = s[s.length - 1].toLowerCase()
    zone = `${tzAbbrev.toUpperCase()}`
  }
  return zone
}

export function getConversionText(dateTime: DateTime, str: string) {
  return "`" + `${str}` + "`" + ` in your time is <t:${dateTime.toSeconds()}:t>`
}

export function getVerboseTime(time: TimeStructure) {
  const { meridiem } = time
  let inferredMeridiem
  if (!meridiem) {
    inferredMeridiem = parseInt(time.hour) >= 12 ? "pm" : "am"
  }
  return `${convertTo24hr(time.hour, meridiem || inferredMeridiem)}${
    time.minute
  }`
}

function convertTo24hr(inp: string, meridiem: string) {
  const parsed = parseInt(inp)
  if (meridiem.toLowerCase() === "pm") {
    return (parsed % 12) + 12
  }
  if (parsed < 10 && meridiem.toLowerCase() === "am") {
    return `0${parsed}`
  }
  // exception to handle midnight
  if (parsed === 12 && meridiem.toLowerCase() == "am") {
    return 24
  }
  return parsed
}

type InferredTimezone = {
  smallName: string | null
  timezone: string | FixedOffsetZone | null
  isUTC: boolean
}

export function inferTimezone(item: TimeStructure, user: User | null) {
  const { zone } = item
  let mappedTimezone = ""
  const inferredTimezone: InferredTimezone = {
    smallName: null,
    timezone: null,
    isUTC: false,
  }

  if (zone) {
    if (zone.toLowerCase() in timezoneLocale) {
      mappedTimezone = timezoneLocale[zone.toLowerCase()]
      inferredTimezone.smallName = DateTime.fromJSDate(new Date(), {
        zone: mappedTimezone,
      })
        .toLocaleString(DateTime.DATETIME_FULL)
        .split(" ")
        .pop()!
      inferredTimezone.timezone = mappedTimezone
    } else if (isUTCtimezone(zone)) {
      mappedTimezone = zone
      inferredTimezone.smallName = zone
      inferredTimezone.timezone = FixedOffsetZone.parseSpecifier(zone)
      inferredTimezone.isUTC = true
    }
  } else if (!zone && user) {
    mappedTimezone = user.defaultTz
  }
  return inferredTimezone
}
