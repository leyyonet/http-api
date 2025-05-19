import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {PolyGivenParams} from "./index.types";

export function Cookies(): ParameterDecorator;
export function Cookies(allCookies: true): ParameterDecorator;
export function Cookies(fields: Array<string>, isRemoteSnakeCase?: boolean): ParameterDecorator;
export function Cookies(map: Record<string, string>, supportMultiMapping?: boolean): ParameterDecorator;
export function Cookies(allOrFields?: true | Array<string> | Record<string, string>, snakeOrSupport?: boolean): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {allOrFields, snakeOrSupport});
}

const id = decoratorPool.newId<PolyGivenParams>(Cookies)
    .fqn(FQN_PCK)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p)
    });
