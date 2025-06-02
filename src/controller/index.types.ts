import {ClassReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {Obj} from "@leyyo/common";
import {EndpointItem} from "../endpoint";
import {AttachmentItem} from "../attachment";
import {RouterItem} from "../router";
import {HttpControllerDoc, HttpMethod} from "@leyyo/http";

export interface ControllerProcessorLike {
    allClasses: Map<ClassReflectionLike, ControllerItem>;
    pendingControllers: Set<ClassReflectionLike>;

    newItem(classRef: ClassReflectionLike, path: string): ControllerItem;
    clear(): void;

    fetchClasses(): void;

    bindItem(item: ControllerItem, parent: ControllerItem, all: AllPaths): void;
    printDeploy(): void;
}

export interface ControllerItem extends HttpControllerDoc {
    instance: Obj;
    endpoints: Map<PropertyReflectionLike, EndpointItem>;
    controllers: Map<ClassReflectionLike, AttachmentItem>;
    parent?: ControllerItem;
}

export interface AllPaths {
    routers: Map<string, Array<ControllerItem>>;
    endpoints: Map<HttpMethod, Map<string, Array<EndpointItem>>>;
}
