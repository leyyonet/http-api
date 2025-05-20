import {EndpointItem, EndpointProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {decoratorPool, lifecycle, PropertyReflectionLike} from "@leyyo/core";
import {httpSigner, Method, MethodOpt} from "@leyyo/http";
import {$assert, $descriptor, $dev, $log, $repo, $test, List} from "@leyyo/common";
import {FQN_PCK} from "../internal";
import {injectionPool} from "../../../injection";


export class EndpointProcessor implements EndpointProcessorLike {
    private readonly logger = $log.create(EndpointProcessor);

    allEndpoints: Map<PropertyReflectionLike, EndpointItem>;

    constructor(private pool: ApiPoolLike) {
        this.allEndpoints = $repo.newMap(FQN_PCK, 'allEndpoints');
    }

    newItem(methodRef: PropertyReflectionLike, path: string|RegExp): EndpointItem {
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
    bindMethods(): void {
        this.allEndpoints.forEach(item => {
            const instance = injectionPool.getInstance(item.methodRef.clazz.creator, true);
            item.callable = instance[item.methodRef.name];
            $assert.func(item.callable, () => $dev.desc(item.methodRef, {}));
        });
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
                    lifecycle.addWarning(FQN_PCK, 500, {
                        issue: 'Method is already signed as an endpoint',
                        desc: ins.description
                    });
                    return;
                }
                if (httpSigner.isExt(classRef.creator, methodRef.name, 'methods')) {
                    lifecycle.addWarning(FQN_PCK, 501, {issue: 'Method is already signed as an endpoint', desc: ins.description});
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

                    // todo
                    classRef.creator.prototype[methodRef.name]

                    lifecycle.addInfo(FQN_PCK, 510, {issue: 'Endpoint is bound to application', desc: ins.description});
                    return;
                }

                if (!httpSigner.is(classRef.creator, 'http.controller')) {
                    throw $dev.developerError2(FQN_PCK, 520, {issue: 'Controller class is not signed as a controller', desc: ins.description});
                }

                const controllerItem = this.pool.controller.allClasses.get(classRef);
                if (!controllerItem) {
                    throw $dev.developerError2(FQN_PCK, 521, {issue: 'Controller class is not in controllers', host: ins.description});
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

                lifecycle.addInfo(FQN_PCK, 522, {
                    issue: 'Endpoint is bound to controller',
                    desc: ins.description
                });
            });
    }

}
