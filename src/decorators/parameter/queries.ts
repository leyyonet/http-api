import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {PolyGivenParams} from "./index.types";

export function Queries(): ParameterDecorator;
export function Queries(allQueries: true): ParameterDecorator;
export function Queries(fields: Array<string>, isRemoteSnakeCase?: boolean): ParameterDecorator;
export function Queries(map: Record<string, string>, supportMultiMapping?: boolean): ParameterDecorator;
export function Queries(allOrFields?: true | Array<string> | Record<string, string>, snakeOrSupport?: boolean): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {allOrFields, snakeOrSupport});
}

const id = decoratorPool.newId<PolyGivenParams>(Queries)
    .fqn(FQN)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
