class RaceData {
  #allLaptimes
  constructor(
    laptimes,
    finishingTimes,
    laps,
    winningAverage,
    raceName = "SimRacingSystem"
  ) {
    this.laptimes = laptimes
    this.finishingTimes = finishingTimes
    this.laps = laps
    this.winningAverage = winningAverage
    this.raceName = raceName
    this.gridPositions = []
    this.driverPositions = []

    this.allLaptimes = Object.values(laptimes).flat()
  }

  static fromTable(table) {
    let driverName = ""

    let laptimesDict = {}
    let finishingTimes = []
    let laps = null

    for (let i = 0; i < table.children.length; i++) {
      let row = table.children[i]

      if (row.matches(".tcat, .trow2")) {
        driverName = row.children[2].textContent
        laptimesDict[driverName] = []
        if (!laps) {
          laps = parseInt(row.children[9].textContent)
        }
        finishingTimes.push(timeStringToMillis(row.children[8].textContent))
      } else if (row.matches(".content")) {
        let millisTime = timeStringToMillis(row.children[4].textContent)
        laptimesDict[driverName].push(millisTime)
      }
    }

    return new RaceData(
      laptimesDict,
      finishingTimes,
      laps,
      finishingTimes[0] / laps
    )
  }

  raceNameFromTable(table) {
    let imgs = table
      .getElementsByTagName("tr")[0]
      .getElementsByTagName("td")[0]
      .getElementsByTagName("img")

    this.raceName = `${imgs[0].src.split("/").pop().split(".")[0]}_${
      imgs[1].src.split("/").pop().split(".")[0]
    }`
  }

  positionsFromDocument(doc) {
    for (const scriptTag of doc.querySelectorAll("script")) {
      const gridPosResult =
        /\$\s*\(\s*function\s*\(\s*\)\s*{\s*([\d\[\],d=;var\s]*;)/.exec(
          scriptTag.textContent
        )
      if (gridPosResult) {
        let i = 0
        for (const row of gridPosResult[1].trim().split(";")) {
          let [label, data] = row.split("=")
          if (data) {
            label = label.split(" ")[1]
            data = trailingJsonParse(data)
            if (data.length > 0 && data[0].length > 1) {
              this.gridPositions[i] = data[0][1]
              let positions = []
              for (const lap of data) {
                if (lap.length > 1) {
                  positions.push(lap[1])
                } else {
                  break
                }
              }
              this.driverPositions[i] = positions
            }
          }
          i++
        }
        break
      }
    }
  }

  standardDeviationOfLaptimes() {
    let mean =
      this.allLaptimes.reduce((a, b) => a + b) / this.allLaptimes.length
    let sd = Math.sqrt(
      this.allLaptimes
        .map((x) => Math.pow(x - mean, 2))
        .reduce((a, b) => a + b) / this.allLaptimes.length
    )
    return sd
  }

  fastestLaptime() {
    return Math.min(...this.allLaptimes)
  }
}

let raceData = RaceData.fromTable(
  document.querySelector("thead").parentNode.getElementsByTagName("tbody")[0]
)

raceData.raceNameFromTable(document.querySelector("tbody"))
raceData.positionsFromDocument(document)

showEchartsChart(raceData)

async function showEchartsChart(raceData) {
  let styles = `
  .chartTab {
    padding: 0.5rem;
    font-size: 1.5rem;
    background-image:linear-gradient(#a00000, #a00000),linear-gradient(transparent, transparent);
    background-size: 0 2px, auto;
    background-repeat: no-repeat;
    background-position: center bottom;
    transition: background-size 200ms ease-in-out;
    border: 0;
  }

  .chartTab:focus,
  .chartTab:hover {
    background-size: 100% 2px, auto;
  }

  .chartTab.active {
    outline-offset: -4px;
    background-size: 100% 4px, auto;
  }

  .chartContainer {
    padding-left:2rem;
    padding-right:2rem;
    padding-bottom:2rem;
    width: auto;
    max-width:100rem;
    margin:0 auto;
    aspect-ratio: 2/1;
    background-color: #333;
  }

  .tabContainer {
    padding-left:2rem;
    padding-right:2rem;
    width: auto;
    max-width:100rem;
    margin:0 auto;
    background-color: #333;
  }
  `
  let styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)

  let demoContainer = document.querySelector("div.demo-container")
  let demoParent = demoContainer.parentNode

  let tabContainer = document.createElement("div")
  let chartContainer = document.createElement("div")
  demoParent.insertBefore(tabContainer, demoContainer)
  demoParent.insertBefore(chartContainer, demoContainer)
  demoParent.insertBefore(document.createElement("br"), demoContainer)
  demoParent.insertBefore(document.createElement("br"), demoContainer)

  let racePositionsButton = document.createElement("button")
  let raceGapsButton = document.createElement("button")
  let laptimesButton = document.createElement("button")

  racePositionsButton.appendChild(document.createTextNode("Positions"))
  raceGapsButton.appendChild(document.createTextNode("Gaps"))
  laptimesButton.appendChild(document.createTextNode("Laptimes"))

  racePositionsButton.classList.add("chartTab")
  raceGapsButton.classList.add("chartTab")
  laptimesButton.classList.add("chartTab")

  tabContainer.appendChild(racePositionsButton)
  tabContainer.appendChild(raceGapsButton)
  tabContainer.appendChild(laptimesButton)

  chartContainer.classList.add("chartContainer")
  tabContainer.classList.add("tabContainer")

  let chart = echarts.init(chartContainer, "dark")

  let racePositionsData = []
  let laptimesData = []
  let raceGapsData = []
  let minGap = Infinity,
    maxGap = -Infinity
  for (
    let driverIndex = 0;
    driverIndex < Object.keys(raceData.laptimes).length;
    driverIndex++
  ) {
    const [key, value] = Object.entries(raceData.laptimes)[driverIndex]
    if (value.length > 1) {
      laptimesData.push({
        name: key,
        data: value,
        type: "line",
        symbolSize: 10,
        lineStyle: {
          width: 4,
        },
      })

      let raceGaps =
        driverIndex in raceData.gridPositions
          ? [(raceData.gridPositions[driverIndex] - 1) * 1000]
          : [0]
      let cumulTime = 0
      for (let i = 0; i < value.length; i++) {
        const curLap = value[i]
        cumulTime += curLap
        const curTime = cumulTime - raceData.winningAverage * (i + 1)
        raceGaps.push(curTime)
        if (curTime < minGap) minGap = curTime
        if (curTime > maxGap) maxGap = curTime
      }
      raceGapsData.push({
        name: key,
        data: raceGaps,
        type: "line",
        symbolSize: 10,
        lineStyle: {
          width: 4,
        },
      })
      racePositionsData.push({
        name: key,
        data:
          driverIndex in raceData.driverPositions
            ? raceData.driverPositions[driverIndex]
            : [0],
        type: "line",
        symbolSize: 10,
        lineStyle: {
          width: 4,
        },
      })
    }
  }

  let chartLegend = []
  for (const key of Object.keys(raceData.laptimes)) {
    chartLegend.push({ name: key })
  }

  const showLaptimes = () => {
    for (const button of document.querySelectorAll(".chartTab")) {
      button.classList.remove("active")
    }
    laptimesButton.classList.add("active")
    chart.setOption({
      toolbox: {
        feature: {
          restore: {
            show: false,
          },
          saveAsImage: {
            show: true,
            type: "png",
            name: raceData.raceName + "_Laptimes",
          },
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          let result = document.createElement("div")
          result.style = "margin: 0px 0 0;line-height: 1;"
          let lapDiv = document.createElement("div")
          lapDiv.style =
            "font-size: 1rem;color:#666;font-weight:400;line-height: 1;"
          let listDiv = document.createElement("div")
          listDiv.style = "margin: 0px 0 0;line-height: 1;"
          result.appendChild(lapDiv)
          result.appendChild(listDiv)
          let indexValuePairs = []
          for (const data of params) {
            indexValuePairs.push({
              index: data.seriesIndex,
              value: data.value,
            })
          }
          indexValuePairs.sort(function (x, y) {
            return x.value - y.value
          })
          for (const pair of indexValuePairs) {
            let rowDiv = document.createElement("div")
            rowDiv.style = "margin: 0px 0 0;line-height: 1;"
            listDiv.appendChild(rowDiv)
            let colorSpan = document.createElement("span")
            let nameSpan = document.createElement("span")
            let valueSpan = document.createElement("span")
            rowDiv.appendChild(colorSpan)
            rowDiv.appendChild(nameSpan)
            rowDiv.appendChild(valueSpan)
            colorSpan.style = `display:inline-block;margin-right:0.1rem;border-radius:10px;width:1rem;height:1rem;background-color:${
              params[pair.index].color
            };`
            nameSpan.style =
              "font-size:1rem;color:#666;font-weight:400;margin-left:0.25rem;"
            valueSpan.style =
              "float:right;margin-left:2rem;font-size:1rem;color:#666;font-weight:900;"
            const data = params[pair.index]

            nameSpan.innerText = data.seriesName
            valueSpan.innerText = millisToTimeString(data.value)
          }
          return result
        },
      },
      xAxis: {
        name: "laptime",
        data: range(raceData.laps, 1),
      },
      yAxis: {
        axisLabel: {
          formatter: function (value) {
            return millisToTimeString(value, { showMillis: false })
          },
          showMinLabel: false,
          showMaxLabel: false,
        },
      },
      dataZoom: [
        {
          type: "slider",
          left: "left",
          yAxisIndex: 0,
          filterMode: "none",
          startValue: raceData.fastestLaptime() - 500,
          endValue:
            raceData.fastestLaptime() +
            raceData.standardDeviationOfLaptimes() * 1.5,
          labelPrecision: 100,
          labelFormatter: (value) => {
            return millisToTimeString(value, { shortMillis: true })
          },
          width: 50,
        },
        {
          type: "inside",
          yAxisIndex: 0,
          filterMode: "none",
        },
      ],
      series: laptimesData,
    })
  }

  const showRaceGaps = () => {
    for (const button of document.querySelectorAll(".chartTab")) {
      button.classList.remove("active")
    }
    raceGapsButton.classList.add("active")
    chart.setOption({
      toolbox: {
        feature: {
          restore: {
            show: false,
          },
          saveAsImage: {
            show: true,
            type: "png",
            name: raceData.raceName + "_Gaps",
          },
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          let result = document.createElement("div")
          result.style = "margin: 0px 0 0;line-height: 1;"
          let lapDiv = document.createElement("div")
          lapDiv.style =
            "font-size: 1rem;color:#666;font-weight:400;line-height: 1;"
          let listDiv = document.createElement("div")
          listDiv.style = "margin: 0px 0 0;line-height: 1;"
          result.appendChild(lapDiv)
          result.appendChild(listDiv)
          let indexValuePairs = []
          for (const data of params) {
            indexValuePairs.push({
              index: data.seriesIndex,
              value: data.value,
            })
          }
          indexValuePairs.sort(function (x, y) {
            return x.value - y.value
          })
          let leader = null
          for (const pair of indexValuePairs) {
            let rowDiv = document.createElement("div")
            rowDiv.style = "margin: 0px 0 0;line-height: 1;"
            listDiv.appendChild(rowDiv)
            let colorSpan = document.createElement("span")
            let nameSpan = document.createElement("span")
            let valueSpan = document.createElement("span")
            rowDiv.appendChild(colorSpan)
            rowDiv.appendChild(nameSpan)
            rowDiv.appendChild(valueSpan)
            colorSpan.style = `display:inline-block;margin-right:0.1rem;border-radius:10px;width:1rem;height:1rem;background-color:${
              params[pair.index].color
            };`
            nameSpan.style =
              "font-size:1rem;color:#666;font-weight:400;margin-left:0.25rem;"
            valueSpan.style =
              "float:right;margin-left:2rem;font-size:1rem;color:#666;font-weight:900;"
            const data = params[pair.index]
            let time
            if (leader !== null) {
              time = "+" + millisToTimeString(data.value - leader)
            } else {
              lapDiv.innerText = "Lap: " + (data.dataIndex + 1).toString()
              time = millisToTimeString(
                raceData.winningAverage * data.dataIndex + data.value
              )
              leader = data.value
            }

            nameSpan.innerText = data.seriesName
            valueSpan.innerText = time
          }
          return result
        },
      },
      xAxis: {
        data: range(raceData.laps + 1),
      },
      yAxis: {
        name: "gap to winning pace",
        axisLabel: {
          formatter: function (value) {
            return millisToTimeString(value, { showMillis: false })
          },
          showMinLabel: false,
          showMaxLabel: false,
        },
      },
      dataZoom: [
        {
          type: "slider",
          left: "left",
          yAxisIndex: 0,
          filterMode: "none",
          startValue: minGap - 500,
          endValue: maxGap + 500,
          labelPrecision: 100,
          labelFormatter: function (value) {
            return millisToTimeString(value, { shortMillis: true })
          },
          width: 50,
        },
        {
          type: "inside",
          yAxisIndex: 0,
          filterMode: "none",
        },
      ],
      series: raceGapsData,
    })
  }

  const showRacePositions = () => {
    for (const button of document.querySelectorAll(".chartTab")) {
      button.classList.remove("active")
    }
    racePositionsButton.classList.add("active")
    chart.setOption({
      toolbox: {
        feature: {
          restore: {
            show: false,
          },
          saveAsImage: {
            show: true,
            type: "png",
            name: raceData.raceName + "_Race",
          },
        },
      },
      tooltip: {
        trigger: "none",
        formatter: null,
        /*formatter: function (params) {
          //TODO ? show positions on the left
          let result = document.createElement("div")
          result.style = "margin: 0px 0 0;line-height: 1;"
          let lapDiv = document.createElement("div")
          lapDiv.style =
            "font-size: 1rem;color:#666;font-weight:400;line-height: 1;"
          let listDiv = document.createElement("div")
          listDiv.style = "margin: 0px 0 0;line-height: 1;"
          result.appendChild(lapDiv)
          result.appendChild(listDiv)
          let indexValuePairs = []
          for (const data of params) {
            indexValuePairs.push({
              index: data.seriesIndex,
              value: data.value,
            })
          }
          indexValuePairs.sort(function (x, y) {
            return x.value - y.value
          })
          let leader = null
          for (const pair of indexValuePairs) {
            let rowDiv = document.createElement("div")
            rowDiv.style = "margin: 0px 0 0;line-height: 1;"
            listDiv.appendChild(rowDiv)
            let colorSpan = document.createElement("span")
            let nameSpan = document.createElement("span")
            let valueSpan = document.createElement("span")
            rowDiv.appendChild(colorSpan)
            rowDiv.appendChild(nameSpan)
            rowDiv.appendChild(valueSpan)
            colorSpan.style = `display:inline-block;margin-right:0.1rem;border-radius:10px;width:1rem;height:1rem;background-color:${
              params[pair.index].color
            };`
            nameSpan.style =
              "font-size:1rem;color:#666;font-weight:400;margin-left:0.25rem;"
            valueSpan.style =
              "float:right;margin-left:2rem;font-size:1rem;color:#666;font-weight:900;"
            const data = params[pair.index]
            let time
            if (leader !== null) {
              time = "+" + millisToTimeString(data.value - leader)
            } else {
              lapDiv.innerText = "Lap: " + (data.dataIndex + 1).toString()
              time = millisToTimeString(
                raceData.winningAverage * data.dataIndex + data.value
              )
              leader = data.value
            }

            nameSpan.innerText = data.seriesName
            valueSpan.innerText = time
          }
          return result
        },*/
      },
      xAxis: {
        data: range(raceData.laps + 1),
      },
      yAxis: {
        name: "position",
        axisLabel: {
          formatter: null,
          showMinLabel: true,
          showMaxLabel: true,
        },
      },
      dataZoom: [],
      series: racePositionsData,
    })
  }

  racePositionsButton.addEventListener("click", showRacePositions)
  raceGapsButton.addEventListener("click", showRaceGaps)
  laptimesButton.addEventListener("click", showLaptimes)

  let chartColors = await scrapeColors()

  chart.setOption({
    backgroundColor: "#0000",

    xAxis: {
      axisLine: {
        onZero: false,
      },
      type: "category",
      name: "lap",
      nameLocation: "middle",
      nameGap: 35,
      position: "top",
    },
    yAxis: {
      inverse: true,
      type: "value",
      nameLocation: "middle",
      nameGap: 35,
      splitNumber: 10,
      scale: true,
      axisLabel: {
        show: true,
      },
    },
    legend: {
      data: chartLegend,
      right: "right",
      top: 50,
      itemHeight: 20,
      textStyle: {
        fontSize: 14,
      },
    },
    grid: {
      right: "200",
      left: "120",
    },
    color: chartColors,
  })

  showRacePositions()

  window.addEventListener("resize", function () {
    chart.resize()
  })
}

async function scrapeColors() {
  let chartColors = []
  let legendColors = null
  for (let i = 0; i < 5; i++) {
    legendColors = document.getElementsByClassName("legendColorBox")
    if (legendColors.length > 0) {
      break
    }
    await sleep(100)
  }
  if (legendColors == null) {
    return null
  }
  for (const c of legendColors) {
    let r, g, b
    ;[r, g, b] = c.children[0].children[0].style
      .getPropertyValue("border")
      .substring(10)
      .replace(" ", "")
      .split(",")
    r = parseInt(r.substring(4)).toString(16)
    g = parseInt(g).toString(16)
    b = parseInt(b).toString(16)
    chartColors.push("#" + r + g + b)
  }

  return chartColors
}

function timeStringToMillis(s) {
  let factor = 1
  if (s.startsWith("-")) {
    s = s.substring(1)
    factor = -1
  }
  let millis = 0
  let splits = s.split(/\:|\./).map(Number).reverse()
  if (splits.length === 4) {
    millis += splits[3] * 1000 * 60 * 60
  }
  millis += splits[2] * 1000 * 60
  millis += splits[1] * 1000
  millis += splits[0]

  return millis * factor
}

function millisToTimeString(value, { shortMillis, showMillis } = {}) {
  if (showMillis === undefined) {
    showMillis = true
  }
  if (shortMillis === undefined) {
    shortMillis = false
  }

  value = Math.floor(value)
  let result = ""
  if (value < 0) {
    value = Math.abs(value)
    result += "-"
  }
  const hasHours = value >= 1000 * 60 * 60
  const hasMinutes = value >= 1000 * 60

  if (hasHours) {
    result += Math.floor(value / 1000 / 60 / 60) + ":"
  }
  if (hasMinutes) {
    result +=
      pad(
        Math.floor((value % (1000 * 60 * 60)) / 1000 / 60),
        hasHours ? 2 : 1
      ) + ":"
  }
  result += pad(Math.floor((value % (1000 * 60)) / 1000), hasMinutes ? 2 : 1)
  if (showMillis) {
    result +=
      "." +
      (shortMillis ? Math.floor((value % 1000) / 100) : pad(value % 1000, 3))
  }
  return result
}

function pad(num, size) {
  num = num.toString()
  while (num.length < size) num = "0" + num
  return num
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function range(length, start = 0) {
  return [...Array(length).keys()].map((i) => i + start)
}

function parseParameters(parameterString) {
  let result = {}
  let params = parameterString.split("&")
  for (let param of params) {
    let [key, value] = param.split("=")
    result[key] = value
  }
  return result
}

function trailingJsonParse(string) {
  return JSON.parse(string.replace(/,([ \t\n]*[\}\]\)])/g, "$1"))
}
