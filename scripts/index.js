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

async function start () {
    const data = await getDestinationData()
    let a = new Set()
    if (data) {
        for (const d of data.records) {
            a.add(d["Attraction_Type"])
        }
    }
    console.log(a)
    console.log(data ?? "err...")
}

start()