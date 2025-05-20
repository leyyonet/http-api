import {ClassReflectionLike, DecoInstanceLike, PropertyReflectionLike} from "@leyyo/core";
import {HttpMethod, HttpParameter, HttpPlaceExtended} from "@leyyo/http";
import {ParameterItem} from "../parameter";
import {AsyncFnc, DevOpt, List} from "@leyyo/common";
import e from "express";
import {ControllerDoc} from "../controller";
import {ApplicationDoc} from "../application";

export interface EndpointProcessorLike {
    allEndpoints: Map<PropertyReflectionLike, EndpointItem>;
    newItem(methodRef: PropertyReflectionLike, path: string): EndpointItem;
    clear(): void;
    fetchMethods(): void;
    bindMethods(): void;
}

export interface EndpointDoc {
    path: string|RegExp;
    fullPath: string;
    method: HttpMethod;
    controller: ControllerDoc;
}
export interface EndpointItem {
    inController?: boolean;
    methodRef: PropertyReflectionLike;
    ins: DecoInstanceLike;
    callable?: AsyncFnc;

    classRef: ClassReflectionLike;
    methods: Array<HttpMethod>;
    path: string|RegExp;

    parameters: Array<ParameterItem>;

    // from single
    uniqueNames: Record<HttpPlaceExtended, Array<string>>; // <place, name[]>
    // from single or multiple
    reservedNames: Record<HttpPlaceExtended, Array<string>>; // <place, name[]>
    // from multiple
    allUsed: Record<HttpPlaceExtended, Array<number>>; // <place, index[]>

    kindMap: Record<HttpParameter, number>; // kind / index

    // provided by routes
    pathNames: Array<string>;
    ignorableNames: Array<string>;

    // 1 - cloned from pathNames
    // 2 - must be empty at the end
    usableNames: List<string>;
}
export interface EndpointKindMap {

}
