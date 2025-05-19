import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";

interface Opt {
}

export function Body(): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        id.process([clazz, propertyKey, index], {});
}

const id = decoratorPool.newId<Opt>(Body)
    .fqn(FQN_PCK)
    .targets('parameter')
    .rules('no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        ins.set(p)
    });