import {ControllerItem, ControllerProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {ClassReflectionLike, decoratorPool, lifecycle} from "@leyyo/core";
import {Controller, ControllerOpt} from "../decorators";
import {$descriptor, $dev, $log, $repo} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {FQN_PCK} from "../internal";

export class ControllerProcessor implements ControllerProcessorLike {
    private readonly logger = $log.create(ControllerProcessor);
    allClasses: Map<ClassReflectionLike, ControllerItem>;
    pendingControllers: Set<ClassReflectionLike>;

    constructor(private pool: ApiPoolLike) {
        this.allClasses = $repo.newMap(FQN_PCK, 'allClasses');
        this.pendingControllers = $repo.newSet(FQN_PCK, 'pendingControllers');
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
                    throw $dev.developerError2(FQN_PCK, 300,
                        {issue: 'Controller is already an application',
                        desc: ins.description,
                        clazz: classRef.name});
                }
                if (httpSigner.is(classRef.creator, 'http.controller')) {
                    lifecycle.addWarning(FQN_PCK, 301, {
                        issue: 'Controller is already signed',
                        desc: ins.description,
                        clazz: classRef.name
                    });
                    return;
                }
                if (this.allClasses.has(classRef)) {
                    lifecycle.addWarning(FQN_PCK, 302, {
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

                lifecycle.addInfo(FQN_PCK, 303, {
                    issue: 'Controller is signed',
                    desc: ins.description,
                    clazz: classRef.name
                });
            });
    }

}
