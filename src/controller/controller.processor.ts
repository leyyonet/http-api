import {Router} from "express";
import {ClassReflectionLike, decoratorPool} from "@leyyo/core";
import {middlewarePool} from "@leyyo/middleware";
import {$dev, $log, $repo} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {injectionPool} from "@leyyo/injection";

import {Controller, ControllerOpt} from "../decorators";
import {FQN} from "../internal";
import {apiHelper} from "../helper";
import {ApiPoolLike} from "../pool";
import {AllPaths, ControllerItem, ControllerProcessorLike} from "./index.types";

export class ControllerProcessor implements ControllerProcessorLike {
    private readonly logger = $log.create(ControllerProcessor);
    allClasses: Map<ClassReflectionLike, ControllerItem>;
    pendingControllers: Set<ClassReflectionLike>;

    constructor(private pool: ApiPoolLike) {
        this.allClasses = $repo.newMap(FQN, 'allClasses');
        this.pendingControllers = $repo.newSet(FQN, 'pendingControllers');
    }

    newItem(classRef: ClassReflectionLike, path: string|RegExp): ControllerItem {
        return {
            classRef,
            path,
            instance: undefined,
            endpoints: new Map(),
            controllers: new Map(),
        } as ControllerItem;
    }

    clear(): void {
        this.allClasses.clear();
        this.pendingControllers.clear();
    }

    fetchClasses(): void {
        const id = decoratorPool.get(Controller, true).asIdentifier;
        id
            .instances
            .forEach(ins => {
                const classRef = ins.asClass;
                if (httpSigner.is(classRef.creator, 'http.ignored')) {
                    return;
                }
                if (httpSigner.is(classRef.creator, 'http.app')) {
                    throw $dev.developerError2(FQN, 300,
                        {issue: 'Controller is already an application',
                        desc: ins.description,
                        clazz: classRef.name});
                }
                if (httpSigner.is(classRef.creator, 'http.controller')) {
                    this.logger.deploy.$warning(FQN, 301, {
                        issue: 'Controller is already signed',
                        desc: ins.description,
                        clazz: classRef.name
                    });
                    return;
                }
                if (this.allClasses.has(classRef)) {
                    this.logger.deploy.$warning(FQN, 302, {
                        issue: 'Controller is duplicated',
                        desc: ins.description,
                        clazz: classRef.name
                    });
                    return;
                }
                const opt = ins.getValue<ControllerOpt>();
                this.pendingControllers.add(classRef);
                const item = this.newItem(classRef, opt.path);
                this.allClasses.set(classRef, item);
                httpSigner.append(classRef.creator, 'http.controller');

                this.logger.deploy.$info(FQN, 303, {
                    issue: 'Controller is signed',
                    desc: ins.description,
                    clazz: classRef.name
                });
            });
    }

    bindItem(item: ControllerItem, parent: ControllerItem, all: AllPaths): void {
        item.router = Router();
        if (!item.instance) {
            item.instance = injectionPool.getInstance(item.classRef.creator, true);
        }
        if (parent) {
            item.fullPath = apiHelper.plainPaths(item.fullPath, parent.fullPath);
        }
        if (middlewarePool.hasClass(item.classRef, true)) {
            middlewarePool.bindForClass(item.classRef, true, {controller: item, app: this.pool.application.item})
        }

        Array.from(item.controllers.values())
            .forEach(attachmentItem => {
                const childItem = attachmentItem.controllerItem;
                this.pool.controller.bindItem(childItem, item, all);
                item.router.use(childItem.path, childItem.router);
            });
        Array.from(item.endpoints.values())
            .forEach(endpointItem => {
                this.pool.endpoint.bindItem(endpointItem, item, all);
            });

        if (middlewarePool.hasClass(item.classRef, false)) {
            middlewarePool.bindForClass(item.classRef, false, {controller: item, app: this.pool.application.item})
        }
    }
    printDeploy(): void {}
}
