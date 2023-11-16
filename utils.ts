import crypto from "node:crypto"
import type { JSONSchema } from "@apidevtools/json-schema-ref-parser/dist/lib/types"

export const isJsonSchema = (schema: JSONSchema | undefined | boolean ): schema is JSONSchema => {
    return typeof schema === "object"
}

export const isPrimary = (type?: string | string[]): boolean => {
    return !!(type && (type.includes("string") || type.includes("boolean") || type.includes("integer")))
}
export const isObject = (type?: string | string[]): boolean => {
    return !!(type && type.includes("object") )
}
export const isArray = (type?: string | string[]): boolean => {
    return !!(type && type.includes("array") )
}


export const createHash = (data: any) => {
    return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex")
}