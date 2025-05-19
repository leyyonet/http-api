import {ClassReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {DevOpt, Obj} from "@leyyo/common";
import {HttpMethod} from "@leyyo/http";
import {EndpointItem} from "../endpoint";

export interface IgnoreProcessorLike {
    ignoredClasses: Set<ClassReflectionLike>;

    clear(): void;
    fetchClasses(): void;
}
