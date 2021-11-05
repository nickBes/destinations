import { Component } from "./components.js"

const DEFAULT_NAME = "יעדים"

function createHeader () {
    let header = new Component("header")
    header.text = DEFAULT_NAME
    header.addAttributes(
        {
            id: "hdr"
        }
    )
    return header
}

function createFooter() {
    let footer = new Component("footer")
    let footer_p = new Component("p")
    footer_p.text = "what's up guys it's me jermey"
    footer.appendChild(footer_p)
    return footer
}

let root = new Component("#root")
let header = createHeader()
let footer = createFooter()

root.delete()
header.render()
root.render()
footer.render()