import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

export function AsRequest(): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {});
}

const id = decoratorPool.newId(AsRequest)
    .fqn(FQN)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p)
    });
