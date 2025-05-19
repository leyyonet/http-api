import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";
import {Param} from "./param";

interface Opt {
    field: string;
}

export function Prm(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        cloned.process([clazz, propertyKey, index], {field});
}

const cloned = decoratorPool.newClone<Opt>(Prm, Param)
    .fqn(FQN_PCK);
