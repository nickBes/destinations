import { Component } from "./components.js"

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

// returns the shared string length between two strings and given indexes
async function sharedStringLength (baseChars, searchChars, baseIndex, searchIndex) {
    let length = 0
    for (let i = baseIndex; i < baseChars.length || searchIndex < searchChars.length; i++) {
        if (baseChars[i] != searchChars[searchIndex]) break
        length++
        searchIndex++
    }
    return length
}

// returns sum of the shared strings lengths
async function sharedStringLengthSum (baseString, searchString) {
    if (typeof baseString != "string") return 0
    const baseChars = baseString.split("")
    const searchChars = searchString.split("")
    let stringOccuranceLengths = []
    // will get create an array of all possible matching strings lengths promises,
    // to get the values in parallel
    searchChars.forEach((searchChar, searchCharIndex) => {
        baseChars.forEach((baseChar, baseCharIndex) => {
            if (baseChar == searchChar) {
                stringOccuranceLengths.push(sharedStringLength(baseChars, searchChars, baseCharIndex, searchCharIndex))
            }
        })
    })
    stringOccuranceLengths = await Promise.all(stringOccuranceLengths)
    // sum the lengths if the array isn't empty
    return stringOccuranceLengths.length == 0 ? 0 : stringOccuranceLengths.reduce((accumelated, currentValue) => accumelated + currentValue)
}

async function filterSuggetions (event, records, dataKey) {
    const text = event.target.value.toLowerCase()
    const suggetions = new Component("#suggestions")
    // if element doesn't exist stop
    if (!suggetions.htmlElement) return
    suggetions.removeChildren()
  
    // create a map between each record's matching score and their indexes,
    // where the matching score is the sum of the shared strings lengths
    let map = await Promise.all(records.map(async (record, index) => {
        return {
            matchingScore: await sharedStringLengthSum(record[dataKey], text),
            index: index
        }
    }))
    map = map.filter(value => value.matchingScore != 0).sort((leftValue, rightValue) => {
        // will switch places if rightValue is bigger the leftValue
        return rightValue.matchingScore - leftValue.matchingScore
    })
    // limit to 5 results
    map = map.slice(0, 5)
    // create & render the suggestion list
    map.forEach(value => {
        let sug = new Component("li")
        sug.text = records[value.index][dataKey]
        suggetions.appendChild(sug)
    })
    suggetions.renderChildren()
}

async function start () {
    const data = await getDestinationData()
    if (data.records) {
        const searchbar = new Component("#searchbar")
        searchbar.htmlElement.oninput = (event) => filterSuggetions(event, data.records, "Name")
    }
}

start()