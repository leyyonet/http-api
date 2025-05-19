import {ClassReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {Obj} from "@leyyo/common";
import {EndpointDoc, EndpointItem} from "../endpoint";
import {HttpMethod} from "@leyyo/http";
import {AttachmentItem} from "../attachment";
import e from "express";
import {ControllerDoc} from "../controller";

export interface ApplicationProcessorLike {
    readonly item: ApplicationItem;

    newItem(): ApplicationItem;
    clear(): void;
    complete(port: number): void;
    fetchClasses(): void;
}

export interface ApplicationItem {
    classRef: ClassReflectionLike;
    instance: Obj;
    contextPath: string|RegExp;
    paths: Map<HttpMethod, Map<string, EndpointItem>>;

    controllers: Map<ClassReflectionLike, AttachmentItem>;
    endpoints: Map<PropertyReflectionLike, EndpointItem>;
}
export interface ApplicationDoc extends RouterDoc {
    native: e.Express;
    port: number;
}
export interface RouterDoc {
    router: e.Router;
    fullPath: string;
    path: string|RegExp;
    endpoints: Map<HttpMethod, Map<string|RegExp, EndpointDoc>>;
    controllers: Map<string|RegExp, ControllerDoc>;
}
