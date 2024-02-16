import { DateTime } from "luxon"
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
  const matcher = /(\d{1,2}(:?\d{2})?\s?[ap]m)\s*((UTC[+-]\d+)|([a-z]{3}))/gim
  const timeMatches = str.match(matcher)
  const structuredTimes: TimeStructure[] = []
  if (timeMatches?.length) {
    timeMatches.forEach((match) => {
      const timeNumbers = match.match(/([0-9])+/g)
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
      let meridiem
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
    if (
      structuredTimes.find((time) => !time.zone) &&
      structuredTimes.find((time) => !!time.zone)
    ) {
      const defaultZone = structuredTimes.find((time) => time.zone)
      if (defaultZone) {
        structuredTimes.map((time) =>
          time.zone ? time.zone : (time.zone = defaultZone.zone)
        )
      }
    }
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

function getZoneFromText(str: string) {
  let s = str.split(" ")
  let zone: string | null = null
  let tzAbbrev: string = ""
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

export function inferTimezone(item: TimeStructure, user: User | null) {
  const { zone } = item
  let mappedTimezone = ""

  if (zone) {
    if (zone.toLowerCase() in timezoneLocale) {
      mappedTimezone = timezoneLocale[zone.toLowerCase()]
    }
  } else if (!zone && user) {
    mappedTimezone = user.defaultTz
  }
  if (!mappedTimezone) {
    return {
      smallName: null,
      timezone: null,
    }
  }

  return {
    smallName: DateTime.fromJSDate(new Date(), { zone: mappedTimezone })
      .toLocaleString(DateTime.DATETIME_FULL)
      .split(" ")
      .pop(),
    timezone: mappedTimezone,
  }
}
