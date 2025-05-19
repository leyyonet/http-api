import e from "express";
import {ContextLike} from "@leyyo/http";

import {ControllerProcessorLike} from "../controller";
import {EndpointProcessorLike} from "../endpoint";
import {ParameterProcessorLike} from "../parameter";
import {ApplicationProcessorLike} from "../application";
import {IgnoreProcessorLike} from "../ignore";
import {AttachmentProcessorLike} from "../attachment";

export interface ApiPoolLike {
    start(): void;
    complete(port: number): void;

    clear(): void;
    get attachment(): AttachmentProcessorLike;
    get ignore(): IgnoreProcessorLike;
    get application(): ApplicationProcessorLike;

    get controller(): ControllerProcessorLike;

    get endpoint(): EndpointProcessorLike;

    get parameter(): ParameterProcessorLike;
}

export type ApiGetParamLambda = <T = any>(req: e.Request, res: e.Response) => T;

export type ApiCallLambda = (ctx: ContextLike, values: Array<any>) => Promise<Array<any>>|Array<any>;
export type ApiEndpointLambda = (...values: Array<any>) => Promise<any>;
