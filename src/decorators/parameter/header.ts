import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {MonoParamOpt} from "./index.types";
import {helper} from "./parameter.helper";

export function Header(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {field});
}

const id = decoratorPool.newId<MonoParamOpt>(Header)
    .fqn(FQN_PCK)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p);
    });
