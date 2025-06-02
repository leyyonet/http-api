import {HttpAppDoc} from "@leyyo/http";
import {ControllerItem} from "../controller";

export interface ApplicationProcessorLike {
    readonly item: ApplicationItem;

    newItem(): ApplicationItem;
    clear(): void;
    port(port: number): void;
    contextPath(path: string|RegExp): void;

    fetchClasses(): void;

    bindItem(): void;

    start(): void;
    printDeploy(): void;

}

export interface ApplicationItem extends Omit<HttpAppDoc, 'endpoints'|'parent'>, ControllerItem {
    port: number;
}
