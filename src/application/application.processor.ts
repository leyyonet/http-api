import {ApplicationItem, ApplicationProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {decoratorPool, lifecycle} from "@leyyo/core";
import {HttpApp, HttpAppOpt} from "../decorators";
import {$dev, $log} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {FQN_PCK} from "../internal";
import e from "express";
import express, {Router} from "express";
import {injectionPool} from "../../../injection/src";

export class ApplicationProcessor implements ApplicationProcessorLike {
    private readonly logger = $log.create(ApplicationProcessor);

    item: ApplicationItem;

    constructor(private pool: ApiPoolLike) {
        this.clear();
    }

    newItem(): ApplicationItem {
        return {
            classRef: undefined,
            instance: undefined,
            contextPath: undefined,
            controllers: new Map(),
            endpoints: new Map(),
            paths: new Map(),
        };
    }

    clear(): void {
        this.item = this.newItem();
    }

    complete(port: number): void {
        const router = Router();
        const app = express();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }

    bindInstance(): void {
        this.item.instance = injectionPool.getInstance(this.item.classRef.creator, true);
    }
    fetchClasses(): void {
        let found = false;
        const id = decoratorPool.get(HttpApp, true).asIdentifier;
        id.instances
            .forEach((ins, index) => {
                const classRef = ins.asClass;
                if (this.pool.ignore.ignoredClasses.has(classRef)) {
                    lifecycle.addInfo(FQN_PCK, 100, {
                        message: 'Application is ignored',
                        desc: ins.description,
                    });
                    return;
                }
                if (found) {
                    throw $dev.developerError2(FQN_PCK, 101, {
                        issue: 'Multiple application is defined',
                        desc: ins.description
                    });
                }
                found = true;

                const opt = ins.getValue<HttpAppOpt>();
                this.item.classRef = classRef;
                this.item.contextPath = opt.contextPath;

                lifecycle.addInfo(FQN_PCK, 102, {
                    message: 'Application was found',
                    desc: ins.description,
                });

                //sign
                httpSigner.append(classRef.creator, 'http.app');
            });
        if (!found) {
            throw $dev.developerError2(FQN_PCK, 103, {
                issue: 'There is not any application which is defined',
                desc: id.description
            });
        }
    }
}
