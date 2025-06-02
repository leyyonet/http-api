import e from "express";
import {injectionPool} from "@leyyo/injection";
import {IdValidator, validatorRun} from "@leyyo/validator";
import {middlewarePool} from "@leyyo/middleware";
import {castHub} from "@leyyo/cast";
import {pipeRun} from "@leyyo/pipe";
import {decoratorPool,PropertyReflectionLike} from "@leyyo/core";
import {Context, httpSigner, Method, MethodOpt} from "@leyyo/http";
import {$assert, $dev, $log, $repo, Dict, List} from "@leyyo/common";

import {EndpointItem, EndpointProcessorLike} from "./index.types";
import {ApiCallLambda, ApiGetParamLambda, ApiPoolLike} from "../pool";
import {FQN} from "../internal";
import {AllPaths, ControllerItem} from "../controller";
import {apiHelper} from "../helper";
import {ParameterItem} from "../parameter";


export class EndpointProcessor implements EndpointProcessorLike {
    private readonly logger = $log.create(EndpointProcessor);

    allEndpoints: Map<PropertyReflectionLike, EndpointItem>;

    constructor(private pool: ApiPoolLike) {
        this.allEndpoints = $repo.newMap(FQN, 'allEndpoints');
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

    protected _fillLambda(parameters: Array<ParameterItem>): [Array<number>, Array<ApiGetParamLambda>] {
        const ignoredIndexes = [] as Array<number>;
        const firstLambdas = [] as Array<ApiGetParamLambda>;
        parameters.forEach((parameter, index) => {
            if (parameter.ref.docsAll().filter(doc2 => doc2.ins.identifier.hasKeyword(IdValidator)).length > 0) {
                // todo
            }
            switch (parameter.kind) {
                case 'context':
                    firstLambdas.push(((req: e.Request, _res: e.Response) => Context.fromRequest(req)) as ApiGetParamLambda);
                    ignoredIndexes.push(index);
                    break;
                case 'request':
                    firstLambdas.push(((req: e.Request, _res: e.Response) => req) as ApiGetParamLambda);
                    ignoredIndexes.push(index);
                    break;
                case 'response':
                    firstLambdas.push(((_req: e.Request, res: e.Response) => res) as ApiGetParamLambda);
                    ignoredIndexes.push(index);
                    break;
                case 'application':
                    firstLambdas.push(((req: e.Request, _res: e.Response) => req.app) as ApiGetParamLambda);
                    ignoredIndexes.push(index);
                    break;
                case 'body':
                    firstLambdas.push(((req: e.Request, _res: e.Response) => req.body) as ApiGetParamLambda);
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
        return [ignoredIndexes, firstLambdas];
    }

    newItem(methodRef: PropertyReflectionLike, path: string | RegExp): EndpointItem {
        return {
            methodRef,
            classRef: methodRef.clazz,
            path,
            methods: [],

            parameters: [],
            kindMap: {},
            uniqueNames: {},
            reservedNames: {},
            allUsed: {},

            pathNames: [],
            ignorableNames: [],
            usableNames: new List(),
        } as EndpointItem;
    }

    clear(): void {
        this.allEndpoints.clear();
    }

    fetchMethods(): void {
        const id = decoratorPool.get(Method, true).asIdentifier;
        id
            .instances
            .forEach(ins => {
                const methodRef = ins.asMethod;
                const classRef = methodRef.clazz;
                if (httpSigner.is(classRef.creator, 'http.ignored')) {
                    return;
                }
                if (httpSigner.is(methodRef.callable, 'http.endpoint')) {
                    this.logger.deploy.$warning(FQN, 500, {
                        issue: 'Method is already signed as an endpoint',
                        desc: ins.description
                    });
                    return;
                }
                if (httpSigner.isExt(classRef.creator, methodRef.name, 'methods')) {
                    this.logger.deploy.$warning(FQN, 501, {
                        issue: 'Method is already signed as an endpoint',
                        desc: ins.description
                    });
                    return;
                }

                if (httpSigner.is(classRef.creator, 'http.app')) {
                    const opt = ins.getValue<MethodOpt>();
                    const endpointItem = this.newItem(methodRef, opt.path);
                    endpointItem.inController = false;
                    endpointItem.ins = ins;
                    endpointItem.methods.push(...opt.methods);
                    this.allEndpoints.set(methodRef, endpointItem);
                    this.pool.application.item.endpoints.set(methodRef, endpointItem);
                    httpSigner.append(methodRef.callable, 'http.endpoint');
                    httpSigner.appendExt(classRef.creator, methodRef.name, 'methods');

                    this.logger.deploy.$info(FQN, 510, {issue: 'Endpoint is bound to application', desc: ins.description});
                    return;
                }

                if (!httpSigner.is(classRef.creator, 'http.controller')) {
                    throw $dev.developerError2(FQN, 520, {
                        issue: 'Controller class is not signed as a controller',
                        desc: ins.description
                    });
                }

                const controllerItem = this.pool.controller.allClasses.get(classRef);
                if (!controllerItem) {
                    throw $dev.developerError2(FQN, 521, {
                        issue: 'Controller class is not in controllers',
                        host: ins.description
                    });
                }

                const opt = ins.getValue<MethodOpt>();
                const endpointItem = this.newItem(methodRef, opt.path);
                endpointItem.inController = true;
                endpointItem.ins = ins;
                endpointItem.methods.push(...opt.methods);
                this.allEndpoints.set(methodRef, endpointItem);
                controllerItem.endpoints.set(methodRef, endpointItem);
                httpSigner.append(methodRef.callable, 'http.endpoint');
                httpSigner.appendExt(classRef.creator, methodRef.name, 'methods');

                this.logger.deploy.$info(FQN, 522, {
                    issue: 'Endpoint is bound to controller',
                    desc: ins.description
                });
            });
    }

    protected async _call(item: EndpointItem, lambdaList: Array<ApiCallLambda>, firstLambda: Array<ApiGetParamLambda>, req: e.Request, res: e.Response): Promise<any> {
        let values = firstLambda.map(lambda => lambda(req, res));
        const ctx = Context.fromRequest(req);
        if (lambdaList.length > 0) {
            for (const lambda of lambdaList) {
                values = await lambda(ctx, values);
            }
        }
        return await item.callable(...values);
    }

    bindItem(item: EndpointItem, parent: ControllerItem, all: AllPaths): void {
        const instance = injectionPool.getInstance(item.methodRef.clazz.creator, true);
        item.callable = instance[item.methodRef.name];
        $assert.func(item.callable, () => $dev.desc(item.methodRef, {}));

        item.children = new Map();
        item.fullPath = parent.fullPath + apiHelper.plainPath(item.path);
        item.methods.forEach(method => {
            if (!all.endpoints.has(method)) {
                all.endpoints.set(method, new Map());
            }
            if (!all.endpoints.get(method).has(item.fullPath)) {
                all.endpoints.get(method).set(item.fullPath, []);
            }
            all.endpoints.get(method).get(item.fullPath).push(item);
        });

        const [ignoredIndexes, firstLambdas] = this._fillLambda(item.parameters);

        const lambdaList = [] as Array<ApiCallLambda>;
        // todo
        if (pipeRun.hasMethod('before', item.methodRef, ignoredIndexes)) {
            lambdaList.push((ctx, values) => pipeRun.runForMethod('before', item.methodRef, ctx, values, ignoredIndexes));
        }
        if (castHub.refactor.hasMethod(item.methodRef)) {
            lambdaList.push((_ctx, values) => castHub.refactor.runForMethod(item.methodRef, values));
        }
        if (validatorRun.hasMethod(item.methodRef, ignoredIndexes)) {
            lambdaList.push((ctx, values) => validatorRun.runForMethod(item.methodRef, ctx, values, ignoredIndexes));
        }
        if (pipeRun.hasMethod('after', item.methodRef, ignoredIndexes)) {
            lambdaList.push((ctx, values) => pipeRun.runForMethod('after', item.methodRef, ctx, values, ignoredIndexes));
        }
        if (middlewarePool.hasMethod(item.methodRef, true)) {
            middlewarePool.bindForMethod(item.methodRef, true, {endpoint: item, controller: item.inController ? item.parent : undefined, app: this.pool.application.item})
        }
        // todo response

        item.methods.forEach(method => {
            if (typeof parent.router[method as 'get'] !== 'function') {
                // todo
            }
            parent.router[method as 'get'](item.path, (req, res, next) => {
                this._call(item, lambdaList, firstLambdas, req, res)
                    .then(_result => {
                    })
                    .catch(error => next(error));
            });
            this.logger.debug(`Bound ${item.methods.join(',')} ${item.fullPath} to ${item.methodRef.description}`);
        });
        if (middlewarePool.hasMethod(item.methodRef, false)) {
            middlewarePool.bindForMethod(item.methodRef, false, {endpoint: item, controller: item.inController ? item.parent : undefined, app: this.pool.application.item})
        }
    }
    printDeploy(): void {}
}
