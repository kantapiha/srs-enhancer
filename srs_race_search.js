let styles = `
  #raceSearchBar {
    display:flex;
    box-sizing: border-box;
    padding: 0 5rem;
    height: 3.5rem;
    width: 100%;
    position:sticky;
    background-color:#b40000;
    z-index: 10;
    top: 0;
    border-bottom: 4px solid #2d2d2d   ;
  }

  .searchInputContainer {
    display:flex;
    margin:0.5rem;
    background-color:#4d0000;
  }

  .searchInput {
    width:20rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    font-size: 1rem;
    border:none;
    background-color:transparent;
    color:#fff;
  }
  .searchInput:focus {
    outline: none;
  }

  .searchButton {
    float:right;
    padding: 0.5rem 1rem;
    border:none;
    color:#fff;
    cursor:pointer;
    background-color:transparent;
    opacity:0.6;
  }

  .searchButton:hover,
  .searchButton:focus {
    opacity:1;
  }

  .searchMatch > td {
    background-color: #ff000033;
  }

  .searchMatch.active > td {
    background-color: #00ff0055;
  }

  .raceNameP {
    margin: 0;
  }

  .raceNameP.hidden {
      display: none;
  }

  .resultsText {
    color:#fff;
    padding: 0rem 1rem;
  }

  .resultsUp {
    padding: 0rem 0.25rem;
    border:none;
    color:#fff;
    cursor:pointer;
    background-color:transparent;
    opacity:0.6;
  }

  .resultsDown {
    padding: 0rem 0.25rem;
    border:none;
    color:#fff;
    cursor:pointer;
    background-color:transparent;
    opacity:0.6;
  }

  .resultsUp:hover,
  .resultsUp:focus {
    opacity:1;
  }

  .resultsDown:hover,
  .resultsDown:focus {
    opacity:1;
  }

  resultsUp.hidden,
  resultsDown.hidden {
      display: none;
  }

  .raceLabelsCheckboxContainer {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .checkboxLabel {
    color:#fff;
  }
`

let styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

let topAd = null
let topLevelAds = []

let imageMatches = []
let matchIndex = 0

// Add search bar to the page
let searchBar = document.createElement("div")
searchBar.id = "raceSearchBar"

let searchInputContainer = document.createElement("div")
let searchInput = document.createElement("input")
searchInput.type = "text"
searchInput.placeholder = "Search..."
searchInput.id = "raceSearchInput"
let searchButton = document.createElement("button")

searchInputContainer.classList.add("searchInputContainer")
searchInput.classList.add("searchInput")
searchButton.classList.add("searchButton")

let searchSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
searchSvg.setAttribute("height", "20")
searchSvg.setAttribute("width", "21")
searchSvg.setAttribute("viewBox", "0 0 21 20")
searchSvg.alt = "Search"

let searchSvgPath = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
)
searchSvgPath.setAttribute(
  "d",
  "m264 138.586-1.4847 1.414-4.45515-4.242 1.4847-1.415zm-12.6-4.586c-3.4734 0-6.3-2.691-6.3-6 0-3.308 2.8266-6 6.3-6s6.3 " +
    "2.692 6.3 6c0 3.309-2.8266 6-6.3 6zm0-14c-4.6389 0-8.4 3.582-8.4 8s3.7611 8 8.4 8 8.4-3.582 8.4-8-3.7611-8-8.4-8z"
)
searchSvgPath.setAttribute("fill", "#fff")
searchSvgPath.setAttribute("fill-rule", "evenodd")
searchSvgPath.setAttribute("transform", "translate(-243 -120)")

let matchUpSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
matchUpSvg.setAttribute("height", "20")
matchUpSvg.setAttribute("width", "20")
matchUpSvg.setAttribute("viewBox", "0 0 20 20")
matchUpSvg.alt = "Previous match"

let matchUpSvgPath = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
)
matchUpSvgPath.setAttribute(
  "d",
  "m44 6489 1.393 1.435 7.607-7.607v16.172h2v-16.172l7.586 7.586 1.414-1.414c-3.661-3.661-6.496-6.496-10-10-3.966 3.966-1.166 1.166-10 10"
)
matchUpSvgPath.setAttribute("fill", "#fff")
matchUpSvgPath.setAttribute("fill-rule", "evenodd")
matchUpSvgPath.setAttribute("transform", "translate(-44 -6479)")

let matchDownSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
matchDownSvg.setAttribute("height", "20")
matchDownSvg.setAttribute("width", "20")
matchDownSvg.setAttribute("viewBox", "0 0 20 20")
matchDownSvg.alt = "Next match"

let matchDownSvgPath = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
)
matchDownSvgPath.setAttribute(
  "d",
  "m184 6489-1.393-1.435-7.607 7.607v-16.172h-2v16.172l-7.586-7.586-1.414 1.414 10 10z"
)
matchDownSvgPath.setAttribute("fill", "#fff")
matchDownSvgPath.setAttribute("fill-rule", "evenodd")
matchDownSvgPath.setAttribute("transform", "translate(-164 -6479)")

let resultsText = document.createElement("p")
let resultsUp = document.createElement("button")
let resultsDown = document.createElement("button")

resultsText.classList.add("resultsText")
resultsUp.classList.add("resultsUp", "hidden")
resultsDown.classList.add("resultsDown", "hidden")

let raceLabelsCheckboxContainer = document.createElement("div")
raceLabelsCheckboxContainer.classList.add("raceLabelsCheckboxContainer")
let raceLabelsCheckbox = document.createElement("input")
raceLabelsCheckbox.type = "checkbox"
raceLabelsCheckbox.id = "raceLabelsCheckbox"
let raceLabelsLabel = document.createElement("label")
raceLabelsLabel.htmlFor = "raceLabelsCheckbox"
raceLabelsLabel.textContent = "Show race labels"
raceLabelsLabel.classList.add("checkboxLabel")

let content = document.getElementById("content")
let rows
if (window.location.pathname.includes("historic")) {
  content.insertBefore(searchBar, content.querySelector(":scope > .row"))
  rows = content.querySelector("table").querySelectorAll("tbody")
} else {
  let contentDiv = content.querySelector("div")
  rows = contentDiv.querySelectorAll(".tborder")[1].querySelectorAll("tbody")
  contentDiv.insertBefore(searchBar, contentDiv.querySelectorAll(".tborder")[1])
}
searchBar.appendChild(searchInputContainer)
searchInputContainer.appendChild(searchInput)
searchInputContainer.appendChild(searchButton)
searchButton.appendChild(searchSvg)
searchSvg.appendChild(searchSvgPath)

resultsUp.appendChild(matchUpSvg)
matchUpSvg.appendChild(matchUpSvgPath)
resultsDown.appendChild(matchDownSvg)
matchDownSvg.appendChild(matchDownSvgPath)
searchBar.appendChild(resultsText)
searchBar.appendChild(resultsUp)
searchBar.appendChild(resultsDown)
searchBar.appendChild(raceLabelsCheckboxContainer)
raceLabelsCheckboxContainer.appendChild(raceLabelsCheckbox)
raceLabelsCheckboxContainer.appendChild(raceLabelsLabel)

// Collecting image names
let imageTags = []

for (let row of rows) {
  let pTag = document.createElement("p")
  pTag.classList.add("raceNameP")
  pTag.classList.add("hidden")

  let img = row.querySelector("tr > td > img")
  imageTags.push(pTag)

  pTag.textContent =
    img.alt || parseImageName(img.src.split("/").pop().split(".")[0])

  img.parentNode.appendChild(pTag)
}

raceLabelsCheckbox.addEventListener("change", function () {
  if (this.checked) {
    for (const tag of imageTags) {
      tag.classList.remove("hidden")
    }
  } else {
    for (const tag of imageTags) {
      tag.classList.add("hidden")
    }
  }
})

// Search handling
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchButton.click()
  }
})

searchInput.addEventListener("input", function () {
  if (searchInput.value == "") {
    imageMatches = []
    for (const tag of imageTags) {
      tag.parentNode.parentNode.classList.remove("searchMatch")
    }
    matchIndex = 0
    updateMatches()
  }
})

searchButton.addEventListener("click", function () {
  let searchInputValue = searchInput.value
  let searchInputValueLower = searchInputValue.toLowerCase()
  imageMatches = []
  for (const tag of imageTags) {
    let image = tag.parentNode.querySelector("img")
    if (searchInputValue == "") {
      tag.parentNode.parentNode.classList.remove("searchMatch")
      continue
    }
    if (image.alt) {
      let imageAltLower = image.alt.toLowerCase()
      let allWordsFound = searchInputValueLower
        .split(" ")
        .every((word) => imageAltLower.includes(word))
      if (allWordsFound) {
        tag.parentNode.parentNode.classList.add("searchMatch")
        imageMatches.push(tag.parentNode.parentNode)
        continue
      }
    }
    let imageName = image.src.split("/").pop().split(".")[0]
    let imageNameLower = imageName.toLowerCase()
    let allWordsFound = searchInputValueLower
      .split(" ")
      .every((word) => imageNameLower.includes(word))
    if (allWordsFound) {
      tag.parentNode.parentNode.classList.add("searchMatch")
      imageMatches.push(tag.parentNode.parentNode)
      continue
    }
    tag.parentNode.parentNode.classList.remove("searchMatch")
  }
  matchIndex = 0
  updateMatches()
})

resultsUp.addEventListener("mousedown", function (e) {
  e.preventDefault()
})

resultsDown.addEventListener("mousedown", function (e) {
  e.preventDefault()
})

resultsUp.addEventListener("click", function () {
  matchIndex -= 1
  updateMatches()
})

resultsDown.addEventListener("click", function () {
  matchIndex += 1
  updateMatches()
})

function updateMatches() {
  if (imageMatches.length < 1) {
    if (searchInput.value) {
      resultsText.textContent = "No results"
      resultsUp.classList.add("hidden")
      resultsDown.classList.add("hidden")
    } else {
      resultsText.textContent = ""
      resultsUp.classList.add("hidden")
      resultsDown.classList.add("hidden")
    }
    return
  }
  resultsUp.classList.remove("hidden")
  resultsDown.classList.remove("hidden")
  if (matchIndex < 0) matchIndex = imageMatches.length - 1
  if (matchIndex >= imageMatches.length) matchIndex = 0

  resultsText.textContent = `${matchIndex + 1} of ${imageMatches.length}`

  for (let i = 0; i < imageMatches.length; i++) {
    if (i == matchIndex) {
      imageMatches[i].classList.add("active")
    } else {
      imageMatches[i].classList.remove("active")
    }
  }

  imageMatches[matchIndex].scrollIntoView({
    behavior: "smooth",
    block: "center",
  })
}

// Update search bar location based on the position of the ad
const adObserver = new MutationObserver(function (mutations) {
  for (const mutation of mutations) {
    if (mutation.target.style.display != "none") {
      updateSearchBarPosition(mutation.target)
    }
  }
})
let options = {
  childList: false,
  attributes: true,
  attributeFilter: ["style"],
}

const googleAdsObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.addedNodes) {
      checkAdNodes(mutation.addedNodes)
    }
  })
})

googleAdsObserver.observe(document.body, { childList: true })
checkAdNodes(document.body.querySelectorAll(":scope > .adsbygoogle"))

function checkAdNodes(nodes) {
  if (nodes.length > 0) {
    for (const node of nodes) {
      if (node.classList && node.classList.contains("adsbygoogle")) {
        if (!topLevelAds.includes(node)) {
          topLevelAds.push(node)
          adObserver.observe(node, options)
        }
      }
    }
  }
}

function parseImageName(input) {
  return input
    .replace(/([a-z])([A-Z\d])/g, "$1 $2")
    .replace(/([A-Z\d])([A-Z][a-z])/g, "$1 $2")
}

function updateSearchBarPosition(ad) {
  searchBar.style.top = `${ad.offsetHeight + parseInt(ad.style.top)}px`
}
