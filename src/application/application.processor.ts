import express, {Router} from "express";
import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, $log, Tested} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {injectionPool} from "@leyyo/injection";

import {ApplicationItem, ApplicationProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {HttpApp, HttpAppOpt} from "../decorators";
import {FQN} from "../internal";
import {apiHelper} from "../helper";
import {AllPaths} from "../controller";
import {middlewarePool} from "@leyyo/middleware";

@Tested()
export class ApplicationProcessor implements ApplicationProcessorLike {
    private readonly logger = $log.create(ApplicationProcessor);

    item: ApplicationItem;

    constructor(private pool: ApiPoolLike) {
        this.clear();
    }

    @Tested()
    newItem(): ApplicationItem {
        return {
            locals: {},
            native: undefined,
            port: 80,
            router: undefined,
            fullPath: undefined,
            path: undefined,
            classRef: undefined,
            instance: undefined,
            controllers: new Map(),
            endpoints: new Map()
        };
    }

    clear(): void {
        this.item = this.newItem();
    }

    port(port: number): void {
        $assert.positiveInteger(port, () => $dev.opt({field: 'port'}));
        this.item.port = port;
    }

    contextPath(path: string | RegExp): void {
        this.item.path = apiHelper.checkPath(path);
        this.item.fullPath = apiHelper.plainPath(this.item.path);
    }

    fetchClasses(): void {
        let found = false;
        const id = decoratorPool.get(HttpApp, true).asIdentifier;
        id.instances
            .forEach((ins, index) => {
                const classRef = ins.asClass;
                if (this.pool.ignore.ignoredClasses.has(classRef)) {
                    this.logger.deploy.$info(FQN, 100, {
                        message: 'Application is ignored',
                        desc: ins.description,
                    });
                    return;
                }
                if (found) {
                    throw $dev.developerError2(FQN, 101, {
                        issue: 'Multiple application is defined',
                        desc: ins.description
                    });
                }
                found = true;

                const opt = ins.getValue<HttpAppOpt>();
                this.item.classRef = classRef;
                this.item.path = apiHelper.checkPath(opt.contextPath);

                this.logger.deploy.$info(FQN, 102, {
                    message: 'Application was found',
                    desc: ins.description,
                });

                //sign
                httpSigner.append(classRef.creator, 'http.app');
            });
        if (!found) {
            throw $dev.developerError2(FQN, 103, {
                issue: 'There is not any application which is defined',
                desc: id.description
            });
        }
    }

    bindItem(): void {
        const item = this.item;
        item.router = Router();
        item.native = express();

        const all = {
            routers: new Map(),
            endpoints: new Map(),
        } as AllPaths;

        if (!item.instance) {
            item.instance = injectionPool.getInstance(item.classRef.creator, true);
        }
        if (middlewarePool.hasClass(item.classRef, true)) {
            middlewarePool.bindForClass(item.classRef, true, {app: this.item})
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

        item.native.use(item.path, item.router);

        if (middlewarePool.hasClass(item.classRef, false)) {
            middlewarePool.bindForClass(item.classRef, false, {app: this.item})
        }
    }

    start(): void {
        this.item.native.listen(this.item.port, () => {
            console.log(`Server running on port ${this.item.port}`);
        });
    }
    printDeploy(): void {}
}
