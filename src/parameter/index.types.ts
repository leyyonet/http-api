import {ParameterReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {HttpParameter, HttpPlaceExtended} from "@leyyo/http";
import {EndpointItem} from "../endpoint";

export interface ParameterProcessorLike {
    newItem(ref: ParameterReflectionLike): ParameterItem;
    clear(): void;
    fetchParameters(): void;
    forMethod(methodRef: PropertyReflectionLike, endpointItem: EndpointItem): void;
    printDeploy(): void;
}

export interface ParameterItem {
    ref: ParameterReflectionLike;

    place: HttpPlaceExtended;
    flags: Array<ParameterControlFlag>;
    kind: HttpParameter;

    resource?: string; // from deco
    resourceMap?: Record<string, string>; // from multiple deco
    all?: boolean;
    nameNeeded?: boolean;
}

export type ParameterControlFlag = 'has-deco'
    /**
     * Step 1: Kind is found from @Query, @Body etc
     * */
    | 'kind-from-deco'
    /**
     * Step 2: Name is found from @Query('name1'), @Body('name2') etc
     * */
    | 'resource-from-deco'
    /**
     * Step 3-a: Name in path, /user/id and { ... }get(id: string) {} ... ]
     * */
    | 'resource-from-path'
    /**
     * Step 3-b: Kind is decided after step 3-a
     * */
    | 'kind-from-path'
    /**
     * Step 4-a: Kind is found from reflection name  { ... }get(req) {}
     * */
    | 'kind-from-ref'
    /**
     Step 4-b: Kind is decided after step 4-a
     * */
    | 'resource-from-ref'

    | 'kind-from-empty'
    | 'resource-from-empty'

    | 'use-first-value'

    | 'field-formatted' | 'field-given';
