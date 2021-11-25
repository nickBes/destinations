import { Component } from "./components.js"

function createHeader () {
    let header = new Component("header")

    let link = new Component("a")
    link.addAttributes({href: "./"})

    let image = new Component("img")
    image.addAttributes({src: "./favicon.ico", alt: "מצפן - לוגו יעדים"})

    let title = new Component("h1")
    title.htmlElement.classList.add("title")
    title.text = "יעדים"

    link.appendChild(title)
    link.appendChild(image)
    link.addAttributes({id: "hdr"})

    header.appendChild(link)
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
    githubImage.addAttributes({src: "./media/GitHub_Logo.png", alt:"עמוד Github"})
    github.appendChild(githubImage)

    // let credit = new Component("p")
    // credit.text = "יוצר - ניק בספלי"

    links.appendChild(github)
    links.appendChild(info)

    footer.appendChild(links)
    // footer.appendChild(credit)
    return footer
}

let root = new Component("#root")
let header = createHeader()
let footer = createFooter()

root.delete()

header.render()
root.render()
footer.render()


// android keyboard resizes the screen
// so to fix that we set the height to the initial height
// when the screen is resized
const initialHeight = window.innerHeight
const viewport = document.querySelector('meta[name=viewport]')
window.onresize = () => {
    viewport.setAttribute('content', `height=${initialHeight}, width=device-width, initial-scale=1.0`)
}