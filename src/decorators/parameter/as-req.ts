import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {AsRequest} from "./as-request";

interface Opt {
    field: string;
}

export function AsReq(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        cloned.process([clazz, propertyKey, index], {field});
}

const cloned = decoratorPool.newClone<Opt>(AsReq, AsRequest)
    .fqn(FQN_PCK);
