import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {Body} from "./body";

export function Payload(): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        cloned.process([clazz, propertyKey, index], {});
}

const cloned = decoratorPool.newClone(Payload, Body)
    .fqn(FQN_PCK);
