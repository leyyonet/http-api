import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {PolyGivenParams} from "./index.types";

export function Files(): ParameterDecorator;
export function Files(allFiles: true): ParameterDecorator;
export function Files(fields: Array<string>, isRemoteSnakeCase?: boolean): ParameterDecorator;
export function Files(map: Record<string, string>, supportMultiMapping?: boolean): ParameterDecorator;
export function Files(allOrFields?: true | Array<string> | Record<string, string>, snakeOrSupport?: boolean): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {allOrFields, snakeOrSupport});
}

const id = decoratorPool.newId<PolyGivenParams>(Files)
    .fqn(FQN)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
