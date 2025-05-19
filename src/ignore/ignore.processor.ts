import {IgnoreProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {ClassReflectionLike, decoratorPool, lifecycle, reflectionPool} from "@leyyo/core";
import {HttpApp, IgnoreControllers, IgnoreControllersOpt} from "../decorators";
import {$descriptor, $log, $repo} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {FQN_PCK} from "../internal";

export class IgnoreProcessor implements IgnoreProcessorLike {
    private readonly logger = $log.create(IgnoreProcessor);
    ignoredClasses: Set<ClassReflectionLike>;

    constructor(private pool: ApiPoolLike) {
        this.ignoredClasses = $repo.newSet(FQN_PCK, 'ignoredClasses');
    }

    clear(): void {
        this.ignoredClasses.clear();
    }

    fetchClasses(): void {
        const id = decoratorPool.get(IgnoreControllers, true).asIdentifier;
        id
            .instances
            .forEach(ins => {
                const opt = ins.getValue<IgnoreControllersOpt>();
                opt.controllers.forEach(clazz => {
                    const ignoredRef = reflectionPool.get(clazz, false);
                    if (!ignoredRef) {
                        lifecycle.addWarning(FQN_PCK, 200, {
                            issue: 'Ignored class is not reflected',
                            desc: ins.description,
                            clazz: clazz.name,
                        });
                    } else {
                        if (this.ignoredClasses.has(ignoredRef)) {
                            lifecycle.addWarning(FQN_PCK, 201, {
                                issue: 'Ignored class is already ignored',
                                desc: ins.description,
                                clazz: ignoredRef.name,
                            });
                        } else {
                            this.ignoredClasses.add(ignoredRef);
                            httpSigner.append(ignoredRef.creator, 'http.ignored');

                            if (ignoredRef.decorators()
                                .filter(deco => deco.isIdentifier && deco.asIdentifier.fn === HttpApp)
                                .length > 0) {
                                lifecycle.addInfo(FQN_PCK, 202, {
                                    issue: 'Application is ignored',
                                    desc: ins.description,
                                    clazz: ignoredRef.name,
                                });
                            }
                            else {
                                lifecycle.addInfo(FQN_PCK, 203, {
                                    issue: 'Controller is ignored',
                                    desc: ins.description,
                                    clazz: ignoredRef.name,
                                });
                            }
                        }
                    }
                });
            });
    }
}
