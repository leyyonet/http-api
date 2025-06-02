import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {MonoParamOpt} from "./index.types";

export function Header(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {field});
}

const id = decoratorPool.newId<MonoParamOpt>(Header)
    .fqn(FQN)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
