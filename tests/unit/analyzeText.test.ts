import { analyzeText, TimeStructure } from "../../src/utils/"

type TestSentenceStructure = Array<{
  text: string
  expectedResult: Array<TimeStructure>
}>

const testSentences: TestSentenceStructure = [
  // test a single time at the end of a sentence
  {
    text: "Let's meet up at 6pm pst",
    expectedResult: [
      {
        hour: "6",
        minute: "00",
        meridiem: "pm",
        zone: "PST",
      },
    ],
  },
  // test a single time at the beginning of a sentence
  {
    text: "11am EST is when we should meet up",
    expectedResult: [
      {
        hour: "11",
        minute: "00",
        meridiem: "am",
        zone: "EST",
      },
    ],
  },
  // test minutes
  {
    text: "11:51am Cst is when we want to meet",
    expectedResult: [
      {
        hour: "11",
        minute: "51",
        meridiem: "am",
        zone: "CST",
      },
    ],
  },
  // test just a time with no sentence
  {
    text: "12:12pm EST",
    expectedResult: [
      {
        hour: "12",
        minute: "12",
        meridiem: "pm",
        zone: "EST",
      },
    ],
  },
  // test 2 times in the sentence
  {
    text: "We can meet up either at 8am est or 11am est",
    expectedResult: [
      {
        hour: "8",
        minute: "00",
        meridiem: "am",
        zone: "EST",
      },
      {
        hour: "11",
        minute: "00",
        meridiem: "am",
        zone: "EST",
      },
    ],
  },
  // test utc time
  {
    text: "8:30am utc-8",
    expectedResult: [
      {
        hour: "8",
        minute: "30",
        meridiem: "am",
        zone: "UTC-8",
      },
    ],
  },
  // test 24 hour time
  {
    text: "17:30 utc+8",
    expectedResult: [
      {
        hour: "17",
        minute: "30",
        meridiem: "",
        zone: "UTC+8",
      },
    ],
  },
  // test no timezone
  {
    text: "8:30am",
    expectedResult: [
      {
        hour: "8",
        minute: "30",
        meridiem: "am",
        zone: null,
      },
    ],
  },
]

describe("Tests various sentences to confirm the result is correct", () => {
  it("Should correctly parse the sentence and return a structured time object", () => {
    testSentences.forEach((item) => {
      expect(analyzeText(item.text)).toEqual(item.expectedResult)
    })
  })
})
