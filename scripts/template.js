import { Component } from "./components.js"

const DEFAULT_NAME = "יעדים"

let root = new Component("#root")
root.delete()

let header = new Component("header")
header.text = DEFAULT_NAME
header.addAttributes(
    {
        id: "hdr"
    }
)
header.render()

let footer = new Component("footer")
let footer_p = new Component("p")
footer_p.text = "what's up guys it's me jermey"
footer.appendChild(footer_p)

root.render()
footer.render()