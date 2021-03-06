import { Component } from "./components.js"

const dataMapTemplate = {
    "Name": "שם",
    "Address": "מקום",
    // "Phone":"טלפון",
    // "Email":"מייל",
    "URL":"אתר",
    "Opening_Hours":"שעות פתיחה"
}

const headerKey = "Name"
const filterKey = "Attraction_Type"
const urlKey = "URL"

// this is the number that is responsible for 
// the best results in the matching score algorithm
const mutualStringsAmountWeight = 1.45

// creates an array of css bg-color attribute that is mapped to the variables
// that exist in index.css

const headerColors = "abc".split("").map(value => `background-color: var(--${value})`)

async function getDestinationData () {
    const url = "https://data.gov.il/api/3/action/datastore_search"
    const resource_id = "29f4ec99-ec7f-43c1-947e-60a960980607"

    // sends an http requrest to the gov's api at the required
    // resource, and returns a promise of the formatted data
    // if the request was successful
    return fetch(`${url}?resource_id=${resource_id}`)
            .then(async response => {
                const { result } = await response.json()
                return result
            }).catch(error => console.error(error))
}

// returns the mutual string length between two strings and given indexes
async function sharedStringLength (baseChars, searchChars, baseIndex, searchIndex) {
    let length = 0
    for (let i = baseIndex; i < baseChars.length || searchIndex < searchChars.length; i++) {
        if (baseChars[i] != searchChars[searchIndex]) break
        length++
        searchIndex++
    }
    return length
}

// will return the sum of mutual strings lengths minus the amount of mutual strings strings.

async function calculateMatchingScore (baseString, searchString) {
    if (typeof baseString != "string") return 0
    const baseChars = baseString.split("")
    const searchChars = searchString.split("")
    let mutualStringLengths = []

    // will create an array of all possible occurances for the sharedStringPromises (based on the base and earch strings),
    // to get the values in parallel
    searchChars.forEach((searchChar, searchCharIndex) => {
        baseChars.forEach((baseChar, baseCharIndex) => {
            if (baseChar == searchChar) {
                mutualStringLengths.push(sharedStringLength(baseChars, searchChars, baseCharIndex, searchCharIndex))
            }
        })
    })
    mutualStringLengths = await Promise.all(mutualStringLengths)
    // sum the lengths if the array isn't empty
    // and remove the amount of mutual string to increase relevancy
    // as there might be multiple non relevant mutual strings included
    return mutualStringLengths.length == 0 ? 0 : mutualStringLengths.reduce((accumelated, currentValue) => accumelated + currentValue) - (mutualStringLengths.length * mutualStringsAmountWeight)
}


async function filterSuggetions (event, records, types) {
    // prevents from running default method during this event
    event.preventDefault()

    const searchbar = new Component("#searchbar")
    const suggetions = new Component("#suggestions")
    const selection = new Component("#selection")

    // if element doesn't exist stop
    if (!suggetions.htmlElement || !searchbar.htmlElement || !searchbar.htmlElement) return

    const text = searchbar.htmlElement.value?.toLowerCase()
    const filter = selection.htmlElement.value

    // if filter doesn't exist or if user modified the value from the selection, stop
    if (!filter || (!types.has(filter) && filter != "default")) return

    suggetions.removeChildren()
    let filtered = filter == "default" ? records : records.filter(value => value[filterKey] == filter)
  
    if (text != "") {
        // create a map between each record's matching score and their indexes,
        // where the matching score is the sum of the shared strings lengths
        let map = await Promise.all(filtered.map(async (record, index) => {
            return {
                matchingScore: await calculateMatchingScore(record[headerKey], text),
                index: index
            }
        }))
        // filters by the filter value from the selections and by the score
        // also sorts the results
        map = map.filter(value => value.matchingScore > 0)
                .sort((leftValue, rightValue) => {
                    // will switch places if rightValue is bigger the leftValue
                    return rightValue.matchingScore - leftValue.matchingScore
                })

        
        // create & render the suggestion list
        map.forEach(value => {
            let objectData = createRecordDataMap(filtered[value.index], dataMapTemplate)     
            let sug = createSuggestionComponent(objectData)
            suggetions.appendChild(sug)
        })
    } else {
        filtered.forEach(value => {
            let objectData = createRecordDataMap(value)     
            let sug = createSuggestionComponent(objectData)
            suggetions.appendChild(sug)
        })
    }
    // the situation where there are no results
    let thereAreResults = true
    if (suggetions.children.length == 0) {
        let noResult = new Component("li")
        noResult.addAttributes({id: "no-rslt"})
        noResult.text = "אין תוצאות רלוונטיות"
        suggetions.appendChild(noResult)
        thereAreResults = false
    }
    suggetions.renderChildren()

    // will add the expand function to children that their text is overflowing
    if (thereAreResults) {
        suggetions.children.forEach(child => {
            createExpandMethod(child.htmlElement)
        })
    }


    // will close an open keyboard on phone device when the form is submitted
    searchbar.htmlElement.blur()
}

function createExpandMethod(element) {
    const isOverflowing = element.clientHeight < element.scrollHeight
    if (isOverflowing) {
        element.onclick = () => {
            element.classList.toggle("card-ratio")
            element.classList.toggle("card-more")
        }
        element.classList.add("card-more")
        element.setAttribute("title", "קרא עוד")
    }
}   

// will return an object that has the values inside the 
// dataMapTemplate as keys and the values inside the recieved record
// of the according key. so later we'll be able to format this data in html

function createRecordDataMap(record) {

    let n = {}
    for (const key in record) {
        if (key in dataMapTemplate) {
            n[dataMapTemplate[key]] = record[key]
        }
    }
    return n
}

function createSuggestionComponent(dataObject) {
    let sug = new Component("li")
    sug.htmlElement.classList.add("card", "card-ratio")

    let mappedHeaderKey = dataMapTemplate[headerKey]
    let mappedUrlKey = dataMapTemplate[urlKey]

    // creates a heading for the card
    if (mappedHeaderKey && mappedHeaderKey in dataObject) {
        let header = new Component("h3")
        header.htmlElement.classList.add("card-header")
        header.text = dataObject[mappedHeaderKey]
        header.addAttributes({style: headerColors[Math.round(Math.random() * (headerColors.length - 1))]})
        sug.appendChild(header)

        delete dataObject[mappedHeaderKey]
    }

    // create a url for the card
    if (mappedUrlKey && mappedUrlKey in dataObject) {
        let url = new Component("a")
        url.htmlElement.classList.add("card-url")
        url.addAttributes({href: dataObject[mappedUrlKey]})
        url.text = "עבור לאתר"
        sug.appendChild(url)
        
        delete dataObject[mappedUrlKey]
    }

    for (const key in dataObject) {
        let d = new Component("p")
        d.text = `${key}: ${dataObject[key]}`
        sug.appendChild(d)
    }
    return sug
}


// will collect all of the unique types that exist in the record
// and add them to the selection element, after that it returns it for later use

async function getTypesFromRecords (records) {
    const types = new Set()
    const selection = new Component("#selection")
    for (const record of records) {
        types.add(record[filterKey])
    }
    for (const type of types.values()) {
        let option = new Component("option")
        option.addAttributes({value: type})
        option.text = type
        selection.appendChild(option)
    }
    selection.renderChildren()
    return types
}

// applies all of the created methods as you can't use 
// async methods outside of a function in js

async function start () {
    // display loading until we recieve some response
    const loader = new Component("div")
    loader.addAttributes({id:"loader"})
    loader.render()

    const result = await getDestinationData()

    // if the result was loaded properly continue
    // else create an error screen
    if (result.records) {
        const records = result.records
        const types = await getTypesFromRecords(records)

        loader.delete()
        const form = new Component("#frm")
        form.htmlElement.onsubmit = (event) => filterSuggetions(event, records, types)
    } else {
        const root = new Component("#root")
        root.removeChildren()
        
        const error = new Component("div")
        error.addAttributes({id:"err"})
        error.text = "משהו לא צלח כאן :("

        root.appendChild(error)
        root.renderChildren()
        loader.delete()
    }
}

start()