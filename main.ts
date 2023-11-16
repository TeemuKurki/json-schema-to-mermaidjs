import fs from "fs";
import { MermaidClass, MermaidClient } from "./mermaidClient";
import {$RefParser} from "@apidevtools/json-schema-ref-parser"
import type { JSONSchema } from "@apidevtools/json-schema-ref-parser/dist/lib/types";
import { isArray, isJsonSchema, isObject, isPrimary } from "./utils";





const mermaidClient = new MermaidClient()
const rootClass = new MermaidClass("Root");



const classMap = new Map<string, MermaidClass>()
let rootKey = "Root";

classMap.set(rootKey,rootClass)

function handlePrimaryProperty(property: JSONSchema, propertyName: string, parentKey: string){
    if(isPrimary(property.type)){
        const type = typeof property.type === "string" ? property.type : undefined
        classMap.get(parentKey)?.addAttribute(propertyName, type)
    }
}
function handleArrayProperty(property: JSONSchema, propertyName: string, parentKey: string) {
    if(isArray(property.type)) {
        if(isJsonSchema(property.items)){
            handlePrimaryProperty(property.items, propertyName, parentKey)
            handleObjectProperty(property.items, propertyName, parentKey)
            handleArrayProperty(property.items, propertyName, parentKey)
        }
    }
}
function handleObjectProperty(property: JSONSchema, propertyName: string, parentKey: string) {
    if(isObject(property.type)) {
        if(!classMap.has(propertyName)){
            classMap.set(propertyName,new MermaidClass(propertyName))
        }
        const c1 = classMap.get(propertyName)
        if(c1){
            classMap.get(parentKey)?.addRelation(c1)
            classMap.get(parentKey)?.addAttribute(propertyName, c1.name)
        }
        handleProperties(property, propertyName)
    }
}

function handleProperties(schema: JSONSchema, parentKey: string) {
    const properties = schema.properties;
    const propertyKeys = properties ? Object.keys(properties) : [];
    propertyKeys.forEach(key => {
        const target = properties![key]
        if(target && isJsonSchema(target)){
            handlePrimaryProperty(target, key, parentKey)
            handleObjectProperty(target, key, parentKey)
            handleArrayProperty(target, key, parentKey)
        }
    })
    if(schema.patternProperties){
        const patterns = Object.keys(schema.patternProperties);
        for(const pattern of patterns){
            const target = schema.patternProperties[pattern]
        if(target && isJsonSchema(target)){
            handlePrimaryProperty(target, pattern, parentKey)
            handleObjectProperty(target, pattern, parentKey)
            handleArrayProperty(target, pattern, parentKey)
        }
        }
    }
  
}

$RefParser.dereference("./schemas/example.schema.json").then(schema => {
    handleProperties(schema, rootKey)
    classMap.forEach(val => {
        mermaidClient.addClass(val)
    })
    return mermaidClient
}).then(client => {
    const res = client.compile();
    fs.writeFileSync("./out/chart.mmd", res)
})




