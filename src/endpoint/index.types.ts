import {DecoInstanceLike, PropertyReflectionLike} from "@leyyo/core";
import {HttpEndpointDoc, HttpMethod, HttpParameter, HttpPlaceExtended} from "@leyyo/http";
import {Func, List} from "@leyyo/common";

import {ParameterItem} from "../parameter";
import {AllPaths, ControllerItem} from "../controller";
import {RouterItem} from "../router";

export interface EndpointProcessorLike {
    allEndpoints: Map<PropertyReflectionLike, EndpointItem>;

    newItem(methodRef: PropertyReflectionLike, path: string): EndpointItem;

    clear(): void;

    fetchMethods(): void;

    bindItem(item: EndpointItem, parent: ControllerItem, all: AllPaths): void;

    printDeploy(): void;
}

export interface EndpointItem extends HttpEndpointDoc {
    ins: DecoInstanceLike;
    callable?: Func;

    parent: ControllerItem;
    children: Map<HttpMethod, RouterItem>;


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
