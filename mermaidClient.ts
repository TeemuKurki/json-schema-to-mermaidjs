type Line = string;
type ClassAttribute = string;
type ClassAttributeVisibility = "Public" | "Private" | "Protected" | "Internal"
type ClassRelation = "Inheritance" | "Composition" | "Aggregation" | "Association" | "Link (Solid)" | "Dependency" | "Realization" | "Link (Dashed)"


const handleMarker = (visibility: ClassAttributeVisibility): string =>{
    let marker = "+";
    if(visibility === "Private") marker = "-" 
    else if(visibility === "Protected") marker = "#" 
    else if(visibility === "Internal") marker = "~" 
    return marker
}

export class MermaidClass {
    #name: string
    #label?: string
    #attributes: ClassAttribute[]
    #relations: string[]
    constructor(name: string, label?: string){
        this.#name = name
        this.#label = label
        this.#attributes = []
        this.#relations = []
    }

    get name(){
        return this.#name
    }

    addAttribute(name: string, type: string | undefined, visibility: ClassAttributeVisibility = "Public"){
        let marker = handleMarker(visibility)
        if(!type){
            this.#attributes.push(`${marker}${name}`)
        }
        else {
            this.#attributes.push(`${marker}${name} : ${type}`)
        }
    }

    addMethod(name: string, type: string, visibility: ClassAttributeVisibility = "Public"){
        let marker = handleMarker(visibility)
        this.#attributes.push(`${marker}${name}() : ${type}`)
    }

    addRelation(targetClass: string | MermaidClass, relation: ClassRelation = "Inheritance"){
        const target = targetClass instanceof MermaidClass ? targetClass.#name : targetClass 
        let rel = "<|--";
        if(relation === "Inheritance") rel = "--|>" 
        else if(relation === "Composition") rel = "--*" 
        else if(relation === "Aggregation") rel = "--o" 
        else if(relation === "Association") rel = "-->" 
        else if(relation === "Dependency") rel = "..>" 
        else if(relation === "Realization") rel = "..|>" 
        else if(relation === "Link (Solid)") rel = "--" 
        else if(relation === "Link (Dashed)") rel = ".." 
        this.#relations.push(`${this.#name} ${rel} ${target}`)
    }

    compile(){
        const deduped = Array.from(new Set(this.#attributes));
        const label = this.#label ? `["${this.#label}"]` : ""
        return `class ${this.#name}${label} {\n\t${deduped.map(attribute => `\t${attribute}`).join("\n")}\n}\n${this.#relations.map(rel => `${rel}`).join("\n")}`;
    }
}

export class MermaidClient {
    #type: "classDiagram"
    #lines: Line[]
    title?: string
    constructor(){
        this.#type = "classDiagram"
        this.#lines = []
    }

    addLine(line: Line){
        this.#lines.push(line)
        return this
    }

    addClass(mermaidClass: MermaidClass){
        this.addLine(mermaidClass.compile())
        return this
    }


    compile(){
        const title = this.title ? `---\ntitle: ${this.title}\n---\n` : ""
        return `${title}${this.#type}\n${this.#lines.map(line => `\t${line}`).join("\n")}`;
    }
}