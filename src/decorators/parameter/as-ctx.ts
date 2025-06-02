import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {AsContext} from "./as-context";

interface Opt {
    field: string;
}

export function AsCtx(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        cloned.process([clazz, propertyKey, index], {field});
}

const cloned = decoratorPool.newClone<Opt>(AsCtx, AsContext)
    .fqn(FQN);
