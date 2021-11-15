import { Component } from "./components.js"

function createHeader () {
    let header = new Component("header")
    let title = new Component("h1")
    title.htmlElement.classList.add("title")

    let link = new Component("a")
    link.text = "יעדים"
    link.addAttributes({href: "./"})

    title.appendChild(link)
    header.appendChild(title)

    header.addAttributes({id: "hdr"})
    return header
}

function createFooter() {
    let footer = new Component("footer")
    footer.addAttributes({id: "ftr"})

    let links = new Component("div")
    links.addAttributes({id: "lnks"})

    let info = new Component("h1")
    info.htmlElement.classList.add("title")

    let infoUrl = new Component("a")
    infoUrl.text = "אודות"
    infoUrl.addAttributes({href: "./info.html"})
    info.appendChild(infoUrl)

    let github = new Component("a")
    github.addAttributes({href: "https://github.com/nickBes/destinations"})

    let githubImage = new Component("img")
    githubImage.addAttributes({src: "./media/GitHub_Logo.png", width: "100px", height: "41px"})
    github.appendChild(githubImage)

    let credit = new Component("p")
    credit.text = "ניק בספלי"

    links.appendChild(github)
    links.appendChild(info)

    footer.appendChild(links)
    footer.appendChild(credit)
    return footer
}

let root = new Component("#root")
let header = createHeader()
let footer = createFooter()

root.delete()

header.render()
root.render()
footer.render()