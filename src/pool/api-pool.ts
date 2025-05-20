import {ApiCallLambda, ApiEndpointLambda, ApiGetParamLambda, ApiPoolLike} from "./index-types";
import {decoratorPool, Fqn, lifecycle} from "@leyyo/core";
import {
    $assert,
    $descriptor, $dev,
    $is,
    $log,
    $repo,
    $test,
    Arr,
    AsyncFnc,
    DevOpt,
    Dict,
    List,
    MultipleException
} from "@leyyo/common";
import express, {Router} from "express";
import {IdValidator, validatorRun} from "@leyyo/validator";
import {Context, ContextLike, Ctx} from "@leyyo/http";
import {pipeRun} from "@leyyo/pipe";
import {middlewarePool} from "@leyyo/middleware";
import {FQN_PCK} from "../internal";
import {ApplicationDoc, ApplicationProcessor, ApplicationProcessorLike} from "../application";
import {ControllerDoc, ControllerProcessor, ControllerProcessorLike} from "../controller";
import {EndpointDoc, EndpointProcessor, EndpointProcessorLike} from "../endpoint";
import {ParameterItem, ParameterProcessor, ParameterProcessorLike} from "../parameter";
import {IgnoreProcessor, IgnoreProcessorLike} from "../ignore";
import {AttachmentItem, AttachmentProcessor, AttachmentProcessorLike} from "../attachment";
import e from "express";
import {castPool} from "../../../cast";

@Fqn(FQN_PCK)
class ApiPool implements ApiPoolLike {
    private readonly logger = $log.create(ApiPool);

    private readonly _attachment: AttachmentProcessorLike;
    private readonly _ignore: IgnoreProcessorLike;
    private readonly _application: ApplicationProcessorLike;
    private readonly _controller: ControllerProcessorLike;
    private readonly _endpoint: EndpointProcessorLike;
    private readonly _parameter: ParameterProcessorLike;
    private _port: number = 80;

    constructor() {
        this._attachment = new AttachmentProcessor(this);
        this._ignore = new IgnoreProcessor(this);
        this._application = new ApplicationProcessor(this);
        this._controller = new ControllerProcessor(this);
        this._endpoint = new EndpointProcessor(this);
        this._parameter = new ParameterProcessor(this);

        lifecycle.onInitialize(FQN_PCK, () => this.start());
        lifecycle.onValidate(FQN_PCK, () => this.bind());
        lifecycle.onProcess(FQN_PCK, () => this.process());
    }
    clear(): void {
        lifecycle.clearMessages();

        this._ignore.clear();
        this._application.clear();
        this._controller.clear();
        this._attachment.clear();
        this._endpoint.clear();
        this._parameter.clear();
        decoratorPool.decorators()
            .filter(deco => deco.hasKeyword('api'))
            .forEach(deco => deco.clearInstances());
    }

    get attachment(): AttachmentProcessorLike {
        return this._attachment;
    }

    get ignore(): IgnoreProcessorLike {
        return this._ignore;
    }
    get application(): ApplicationProcessorLike {
        return this._application;
    }

    get controller(): ControllerProcessorLike {
        return this._controller;
    }

    get endpoint(): EndpointProcessorLike {
        return this._endpoint;
    }

    get parameter(): ParameterProcessorLike {
        return this._parameter;
    }

    start() {
        this._ignore.fetchClasses();
        this._application.fetchClasses();
        this._controller.fetchClasses();
        this._attachment.fetchAttachments();
        this._endpoint.fetchMethods();
    }
    bind() {
        this._application.bindInstance();
        this._controller.bindInstances();
        this._endpoint.bindMethods();
    }

    protected _checkPath(path1: string|RegExp, path2: string|RegExp): string|RegExp {
        if ($is.empty(path1)) {
            return $is.empty(path2) ? '/' : path2;
        }
        return path1;
    }
    protected _checkFullPath(parentPath: string, path: string|RegExp): string {
        if ($is.empty(path)) {
            return $is.empty(parentPath) ? '/' : parentPath;
        }
        if (!$is.empty(parentPath)) {
            return parentPath + '/' + String(path);
        }
        return String(path);
    }
    protected _getContext(req: e.Request, res: e.Response): Ctx {
        return undefined;
    }
    protected _getApplication(req: e.Request, _res: e.Response): e.Application {
        return req.app;
    }
    protected _getRequest(req: e.Request, _res: e.Response): e.Request {
        return req;
    }
    protected _getResponse(_req: e.Request, res: e.Response): e.Response {
        return res;
    }
    protected _getBody(req: e.Request, _res: e.Response): any {
        return req.body;
    }
    protected _getPoly(source: Dict, parameter: ParameterItem): any {
        if (parameter.all) {
            return source;
        }
        const result = {};
        for (const [remote, inside] of Object.entries(parameter.resourceMap)) {
            if (source[remote] !== undefined) {
                result[inside] = source[remote];
            }
        }
        return result;
    }

    protected async _call(lambdaList: Array<ApiCallLambda>, fn: ApiEndpointLambda, ctx: ContextLike, values: Array<any>): Promise<any> {
        for (const lambda of lambdaList) {
            values = await lambda(ctx, values);
        }
        return await fn(...values);
    }
    protected _completeController(parentPath: string, attachment: AttachmentItem): ControllerDoc {
        const doc = {
            router: Router(),
            controllers: new Map(),
            endpoints: new Map(),
        } as ControllerDoc;
        const item = attachment.item;
        doc.path = this._checkPath(attachment.path, item.path);
        doc.fullPath = this._checkFullPath(parentPath, doc.path);
        item.controllers
            .forEach(subAttachment => {
                const subDoc = this._completeController(doc.fullPath, subAttachment);
                doc.router.use(subDoc.path, subDoc.router);
            });

        item.endpoints.forEach((endpointItem, ref) => {
            const path = endpointItem.path;
            const fullPath = this._checkFullPath(doc.fullPath, path);
            const ignoredIndexes = [] as Array<number>;
            const firstLambdas = [] as Array<ApiGetParamLambda>;
            endpointItem.parameters.forEach((parameter, index) => {
                if (parameter.ref.docsAll().filter(doc2 => doc2.ins.identifier.hasKeyword(IdValidator)).length > 0) {

                }
                switch (parameter.kind) {
                    case 'context':
                        firstLambdas.push(this._getContext as ApiGetParamLambda);
                        ignoredIndexes.push(index);
                        break;
                    case 'request':
                        firstLambdas.push(this._getRequest as ApiGetParamLambda);
                        ignoredIndexes.push(index);
                        break;
                    case 'response':
                        firstLambdas.push(this._getResponse as ApiGetParamLambda);
                        ignoredIndexes.push(index);
                        break;
                    case 'application':
                        firstLambdas.push(this._getApplication as ApiGetParamLambda);
                        ignoredIndexes.push(index);
                        break;
                    case 'body':
                        firstLambdas.push(this._getBody as ApiGetParamLambda);
                        break;
                    case 'cookie':
                        // todo
                        firstLambdas.push(((req: e.Request, _res: e.Response) => req.cookies[parameter.resource]) as ApiGetParamLambda);
                        break;
                    case 'cookies':
                        // todo
                        firstLambdas.push(((req: e.Request, _res: e.Response) => this._getPoly(req.cookies, parameter)) as ApiGetParamLambda);
                        break;
                    case 'file':
                        // todo
                        firstLambdas.push(((req: e.Request, _res: e.Response) => req.cookies[parameter.resource]) as ApiGetParamLambda);
                        break;
                    case 'files':
                        // todo
                        firstLambdas.push(((req: e.Request, _res: e.Response) => this._getPoly(req.cookies, parameter)) as ApiGetParamLambda);
                        break;
                    case 'header':
                        firstLambdas.push(((req: e.Request, _res: e.Response) => req.headers[parameter.resource]) as ApiGetParamLambda);
                        break;
                    case 'headers':
                        firstLambdas.push(((req: e.Request, _res: e.Response) => this._getPoly(req.headers, parameter)) as ApiGetParamLambda);
                        break;
                    case 'param':
                        firstLambdas.push(((req: e.Request, _res: e.Response) => req.params[parameter.resource]) as ApiGetParamLambda);
                        break;
                    case 'params':
                        firstLambdas.push(((req: e.Request, _res: e.Response) => this._getPoly(req.params, parameter)) as ApiGetParamLambda);
                        break;
                    case 'query':
                        firstLambdas.push(((req: e.Request, _res: e.Response) => req.query[parameter.resource]) as ApiGetParamLambda);
                        break;
                    case 'queries':
                        firstLambdas.push(((req: e.Request, _res: e.Response) => this._getPoly(req.query, parameter)) as ApiGetParamLambda);
                        break;
                    default:
                        firstLambdas.push(((req: e.Request, _res: e.Response) => undefined) as ApiGetParamLambda);
                        break;
                }
            });

            const queueBefore = middlewarePool.forMethod(endpointItem.methodRef, true);
            const queueAfter = middlewarePool.forMethod(endpointItem.methodRef, false);

            // todo
            const fn = ((..._a: Arr) => undefined) as AsyncFnc;

            const lambdaList = [] as Array<ApiCallLambda>;
            lambdaList.push((_ctx, values) => castPool.refactor.runForMethod(endpointItem.methodRef, values));
            lambdaList.push((ctx, values) => pipeRun.forMethod('before', endpointItem.methodRef, ctx, values, ignoredIndexes));
            lambdaList.push((ctx, values) => validatorRun.forMethod(endpointItem.methodRef, ctx, values, ignoredIndexes));
            lambdaList.push((ctx, values) => pipeRun.forMethod('after', endpointItem.methodRef, ctx, values, ignoredIndexes));

            const handler: e.RequestHandler = (req, res, next) => {
                const ctx = Context.fromRequest(req);
                let values = firstLambdas.map(lambda => lambda(req, res));
                this._call(lambdaList, fn, ctx, values)
                    .then(result => {})
                    .catch(error => next(error));
            };

            endpointItem.methods.forEach(method => {
                if (doc.endpoints.has(method)) {
                    doc.endpoints.set(method, new Map());
                }
                doc.router.post(path, handler);
                const endpointDoc = {
                    path,
                    fullPath,
                    method,
                    controller: doc,
                } as EndpointDoc;
                doc.endpoints.get(method).set(path, endpointDoc);
            });
            endpointItem.parameters;

        });

        return doc;
    }
    port(port: number): this {
        $assert.positiveInteger(port, () => $dev.opt({field: 'port'}));
        this._port = port;
        return this;
    }
    protected process(): void {
        const appDoc = {
            port: this._port,
            native: express(),
            router: Router(),
            fullPath: $is.empty(this._application.item.contextPath) ? '/' : String(this._application.item.contextPath),
            path: this._application.item.contextPath,
            endpoints: new Map(),
            controllers: new Map(),
        } as ApplicationDoc;
        this._application.item.controllers
            .forEach(attachment => {
                const controllerDoc = this._completeController(appDoc.fullPath, attachment);
                appDoc.native.use(controllerDoc.path, controllerDoc.router);
            });

        appDoc.native.listen(appDoc.port, () => {
            console.log(`Server running on port ${appDoc.port}`);
        });

    }
    complete(port: number): void {
        const appDoc = {
            port,
            native: express(),
            router: Router(),
            fullPath: $is.empty(this._application.item.contextPath) ? '/' : String(this._application.item.contextPath),
            path: this._application.item.contextPath,
            endpoints: new Map(),
            controllers: new Map(),
        } as ApplicationDoc;
        this._application.item.controllers
            .forEach(attachment => {
                const controllerDoc = this._completeController(appDoc.fullPath, attachment);
                appDoc.native.use(controllerDoc.path, controllerDoc.router);
        });

        appDoc.native.listen(appDoc.port, () => {
            console.log(`Server running on port ${appDoc.port}`);
        });
    }
}

export const apiPool: ApiPoolLike = new ApiPool();
