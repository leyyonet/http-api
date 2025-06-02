import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {Query} from "./query";

interface Opt {
    field: string;
}

export function Qry(field?: string): ParameterDecorator {
    return (clazz, propertyKey, index) =>
        cloned.process([clazz, propertyKey, index], {field});
}

const cloned = decoratorPool.newClone<Opt>(Qry, Query)
    .fqn(FQN);
