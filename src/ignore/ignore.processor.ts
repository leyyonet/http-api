import {IgnoreProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {ClassReflectionLike, decoratorPool,reflectionPool} from "@leyyo/core";
import {HttpApp, IgnoreControllers, IgnoreControllersOpt} from "../decorators";
import {$log, $repo} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {FQN} from "../internal";

export class IgnoreProcessor implements IgnoreProcessorLike {
    private readonly logger = $log.create(IgnoreProcessor);
    ignoredClasses: Set<ClassReflectionLike>;

    constructor(private pool: ApiPoolLike) {
        this.ignoredClasses = $repo.newSet(FQN, 'ignoredClasses');
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
                        this.logger.deploy.$warning(FQN, 200, {
                            issue: 'Ignored class is not reflected',
                            desc: ins.description,
                            clazz: clazz.name,
                        });
                    } else {
                        if (this.ignoredClasses.has(ignoredRef)) {
                            this.logger.deploy.$warning(FQN, 201, {
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
                                this.logger.deploy.$info(FQN, 202, {
                                    issue: 'Application is ignored',
                                    desc: ins.description,
                                    clazz: ignoredRef.name,
                                });
                            }
                            else {
                                this.logger.deploy.$info(FQN, 203, {
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
    printDeploy(): void {}
}
