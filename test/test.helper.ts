import {$test, List} from "@leyyo/common";
import {PropertyReflectionLike} from "@leyyo/core";
import {EndpointItem} from "../src";
import {FQN_PCK} from "../src/internal";

export function newEndpointItem(ref: PropertyReflectionLike, paths?: Array<string>, ignorable?: Array<string>): EndpointItem {
    const endpointItem = {
        methodRef: ref,
        classRef: ref.clazz,
        methods: ['get'],
        path: undefined,

        parameters: [],
        kindMap: {},
        uniqueNames: {},
        reservedNames: {},
        allUsed: {},

        pathNames: [],
        ignorableNames: [],
        usableNames: new List(),

        info: [],
        redundant: [],
        warning: [],

    } as EndpointItem;

    if (Array.isArray(paths) && paths.length > 0) {
        endpointItem.pathNames.push(...paths);
    }
    if (Array.isArray(ignorable) && ignorable.length > 0) {
        endpointItem.ignorableNames.push(...ignorable);
    }
    if (endpointItem.pathNames.length > 0) {
        endpointItem.usableNames.push(...endpointItem.pathNames);
    }
    return endpointItem;
}
export function hasParameterWarning(endpointItem: EndpointItem, index: number, testCase: string|number, pck: string = FQN_PCK): boolean {
    const parameterItem = endpointItem.parameters[index];
    const code = $test.code(pck, testCase);
    return parameterItem && parameterItem.warning.filter(w => w.case === code).length > 0;
}
