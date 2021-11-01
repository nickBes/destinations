const DEFAULT_NAME = "יעדים"

// saves the root element to a variable
// and removes it
let root = document.getElementById("root")
root?.remove()

let header = document.createElement("header")
header.innerText = DEFAULT_NAME

let footer = document.createElement("footer")
let a = document.createElement("a")
a.innerText = "information"
a.setAttribute("href", "./info.html")
footer.innerText = DEFAULT_NAME

// places all of the elements in the
// right order 
document.body.appendChild(header)

// don't do anything if root doesn't exists
root ? document.body.appendChild(root) : ""
document.body.appendChild(footer)
footer.appendChild(a)