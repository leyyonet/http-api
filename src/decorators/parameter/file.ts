import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {MonoParamOpt} from "./index.types";
import {helper} from "./parameter.helper";

export function File(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {field});
}

const id = decoratorPool.newId<MonoParamOpt>(File)
    .fqn(FQN_PCK)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(helper.processSingle(p, ins));
    });
