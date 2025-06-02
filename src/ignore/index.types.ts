import {ClassReflectionLike} from "@leyyo/core";

export interface IgnoreProcessorLike {
    ignoredClasses: Set<ClassReflectionLike>;

    clear(): void;
    fetchClasses(): void;
    printDeploy(): void;
}
