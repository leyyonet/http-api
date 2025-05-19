import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {PolyGivenParams} from "./index.types";

export function Params(): ParameterDecorator;
export function Params(allParams: true): ParameterDecorator;
export function Params(fields: Array<string>, isRemoteSnakeCase?: boolean): ParameterDecorator;
export function Params(map: Record<string, string>, supportMultiMapping?: boolean): ParameterDecorator;
export function Params(allOrFields?: true | Array<string> | Record<string, string>, snakeOrSupport?: boolean): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {allOrFields, snakeOrSupport});
}

const id = decoratorPool.newId<PolyGivenParams>(Params)
    .fqn(FQN_PCK)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
