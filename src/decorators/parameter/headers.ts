import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {PolyGivenParams} from "./index.types";

export function Headers(): ParameterDecorator;
export function Headers(allHeaders: true): ParameterDecorator;
export function Headers(fields: Array<string>, isRemoteSnakeCase?: boolean): ParameterDecorator;
export function Headers(map: Record<string, string>, supportMultiMapping?: boolean): ParameterDecorator;
export function Headers(allOrFields?: true | Array<string> | Record<string, string>, snakeOrSupport?: boolean): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {allOrFields, snakeOrSupport});
}

const id = decoratorPool.newId<PolyGivenParams>(Headers)
    .fqn(FQN_PCK)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
