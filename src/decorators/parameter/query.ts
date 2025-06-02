import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {MonoParamOpt} from "./index.types";

export function Query(): ParameterDecorator;
export function Query(field: string): ParameterDecorator;
export function Query(isRemoteSnakeCase: true): ParameterDecorator;
export function Query(field?: string|true): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {field});
}

const id = decoratorPool.newId<MonoParamOpt>(Query)
    .fqn(FQN)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
