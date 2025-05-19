import {ClassReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {DevOpt, Obj} from "@leyyo/common";
import {HttpMethod} from "@leyyo/http";
import {EndpointDoc, EndpointItem} from "../endpoint";
import {AttachmentItem} from "../attachment";
import e from "express";
import {ApplicationDoc, RouterDoc} from "../application";

export interface ControllerProcessorLike {
    allClasses: Map<ClassReflectionLike, ControllerItem>;
    pendingControllers: Set<ClassReflectionLike>;

    newItem(classRef: ClassReflectionLike, path: string): ControllerItem;
    clear(): void;

    fetchClasses(): void;
}

export interface ControllerDoc extends RouterDoc {
}

export interface ControllerItem {
    classRef: ClassReflectionLike,
    instance: Obj;
    path: string|RegExp;
    endpoints: Map<PropertyReflectionLike, EndpointItem>;
    controllers: Map<ClassReflectionLike, AttachmentItem>;
}
