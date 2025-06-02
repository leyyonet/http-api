import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {AsResponse} from "./as-response";

interface Opt {
    field: string;
}

export function AsRes(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        cloned.process([clazz, propertyKey, index], {field});
}

const cloned = decoratorPool.newClone<Opt>(AsRes, AsResponse)
    .fqn(FQN);
