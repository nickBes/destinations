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

    // there might be multiple non relevant mutual strings that are included
    // in the lengths sum. so we count the amount of substrings to substract it later
    let mutualStringAmount = 0
    // will create an array of all possible occurances for the sharedStringPromises (based on the base and earch strings),
    // to get the values in parallel
    searchChars.forEach((searchChar, searchCharIndex) => {
        baseChars.forEach((baseChar, baseCharIndex) => {
            if (baseChar == searchChar) {
                mutualStringLengths.push(sharedStringLength(baseChars, searchChars, baseCharIndex, searchCharIndex))
                mutualStringAmount++
            }
        })
    })
    mutualStringLengths = await Promise.all(mutualStringLengths)
    // sum the lengths if the array isn't empty
    return mutualStringLengths.length == -mutualStringAmount ? 0 : mutualStringLengths.reduce((accumelated, currentValue) => accumelated + currentValue) - mutualStringAmount
}


async function filterSuggetions (event, records, types, dataKey) {
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
    let filtered = filter == "default" ? records : records.filter(value => value["Attraction_Type"] == filter)
  
    if (text != "") {
        // create a map between each record's matching score and their indexes,
        // where the matching score is the sum of the shared strings lengths
        let map = await Promise.all(filtered.map(async (record, index) => {
            return {
                matchingScore: await calculateMatchingScore(record[dataKey], text),
                index: index
            }
        }))
        // filters by the filter value from the selections and by the score
        // also sorts the results
        map = map.filter(async value => value.matchingScore > 0)
                .sort((leftValue, rightValue) => {
                    // will switch places if rightValue is bigger the leftValue
                    return rightValue.matchingScore - leftValue.matchingScore
                })

        
        // create & render the suggestion list
        map.forEach(value => {
            let sug = new Component("li")
            console.log(filtered[value.index], value.matchingScore)
            sug.text = filtered[value.index][dataKey]
            suggetions.appendChild(sug)
        })
    } else {
        filtered.forEach(value => {
                let sug = new Component("li")
                sug.text = value[dataKey]
                suggetions.appendChild(sug)
        })
    }
    suggetions.renderChildren()
}

async function start () {
    const loader = new Component("#loader")
    loader.text = "Loading"
    const result = await getDestinationData()
    loader.delete()
    if (result) {
        const records = result.records
        const types = new Set()
        const selection = new Component("#selection")
        for (const record of records) {
            types.add(record["Attraction_Type"])
        }
        for (const type of types.values()) {
            let option = new Component("option")
            option.addAttributes({value: type})
            option.text = type
            selection.appendChild(option)
        }
        selection.renderChildren()
        const form = new Component("#form")
        form.htmlElement.onsubmit = (event) => filterSuggetions(event, records, types, "Name")
    } else {
        const root = new Component("#root")
        root.delete()
        const error = new Component("#error")
        error.text = "Error"
    }
}

start()