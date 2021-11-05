function createHtmlElement (name) {
    if (typeof name == "string") {
        try {
            // creates / locates and html element and returns it
            return name.charAt(0) == "#" ? document.getElementById(name.slice(1)) : document.createElement(name)
        } catch (e) {console.error(e)}
    } 
}

function getComponent(value) {
    // returns Component object of some value
    return value instanceof Component ? value : new Component(createHtmlElement(value))
}

class Component {
    constructor (name) {
        this.htmlElement = createHtmlElement(name)
    }
    set text (str) {
        if (typeof str == "string" && this.htmlElement) {
            this.htmlElement.innerText = str
        }
    }
    get text () {
        return this.htmlElement?.innerText
    }
    appendChild (name) {
        // notice that children can be undefined
        if (typeof name)
        if (this.children) {
            this.children.push(getComponent(name))
        } else {
            this.children = [getComponent(name)]
        }
    }
    renderChildren () {
        if (this.children) {
            for (const child of this.children) {
                // child element might be undefined
                if (child.htmlElement) {
                    this.htmlElement.appendChild(child.htmlElement)
                    // will stop when there are no children
                    child.renderChildren()
                }
            }
        }
    }
    addAttributes (attrs) {
        if (typeof attrs == "object" && this.htmlElement) {
            for (const key in attrs) {
                // add the attribute only if the key is of string type
                typeof attrs[key] == "string" ? this.htmlElement.setAttribute(key, attrs[key]) : ""
            }
        }
    }
    render () {
        if (this.htmlElement) {
            document.body.appendChild(this.htmlElement)
            this.renderChildren()
        }
    }
    delete () {
        this.htmlElement?.remove()
    }
}

export { Component }