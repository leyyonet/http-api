import {AttachmentItem, AttachmentProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {
    ClassReflectionLike,
    DecoInstanceLike,
    decoratorPool,
    PropertyReflectionLike,
    reflectionPool
} from "@leyyo/core";
import {AttachController, AttachSubControllerOpt} from "../decorators";
import {$dev, $log, $repo} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {FQN} from "../internal";
import {ControllerItem} from "../controller";
import {apiHelper} from "../helper";

export class AttachmentProcessor implements AttachmentProcessorLike {
    private readonly logger = $log.create(AttachmentProcessor);
    attachedFields: Set<PropertyReflectionLike>;

    constructor(private pool: ApiPoolLike) {
        this.attachedFields = $repo.newSet(FQN, 'attachedFields');
    }

    newItem(controllerItem: ControllerItem, fieldRef?: PropertyReflectionLike): AttachmentItem {
        return {controllerItem, fieldRef} as AttachmentItem;
    }

    clear(): void {
        this.attachedFields.clear();
    }

    fetchAttachments(): void {
        const id = decoratorPool.get(AttachController, true).asIdentifier;
        id
            .instances
            .forEach(ins => {
                if (ins.isClass) {
                    this._attachWithClass(ins.asClass, ins);
                } else if (ins.isField) {
                    this._attachWithField(ins.asField, ins);
                }
            });
    }

    protected _attachWithClass(classRef: ClassReflectionLike, ins: DecoInstanceLike): void {
        if (httpSigner.is(classRef.creator, 'http.ignored')) {
            return;
        }
        const opt = ins.getValue<AttachSubControllerOpt>();
        // attached is ignored
        if (httpSigner.is(opt.controller, 'http.ignored')) {
            this.logger.deploy.$warning(FQN, 400, {
                message: 'Attached controller is ignored',
                host: classRef.name,
                attached: opt.controller.name,
            });
            return;
        }

        const attachedRef = reflectionPool.get(opt.controller, false);
        if (!attachedRef) {
            throw $dev.developerError2(FQN, 401, {
                issue: 'Attached class is not reflected',
                host: classRef.name,
                attached: opt.controller.name
            });
        }
        if (attachedRef === classRef) {
            throw $dev.developerError2(FQN, 402, {
                issue: 'Host class attached itself, circular usage',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.is(attachedRef.creator, 'http.ignored')) { // any proxy case
            return;
        }
        if (!httpSigner.is(attachedRef.creator, 'http.controller')) {
            throw $dev.developerError2(FQN, 403, {
                issue: 'Attached class is not signed as a controller',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.isExt(attachedRef.creator, 'http.attached')) {
            throw $dev.developerError2(FQN, 404, {
                issue: 'Attached is already signed as attached',
                host: classRef.name,
                attached: attachedRef.name
            });
        }

        const controllerItem = this.pool.controller.allClasses.get(attachedRef);
        if (!controllerItem) {
            throw $dev.developerError2(FQN, 405, {
                issue: 'Attached class is not in controller list',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (opt.invalidatePath) {
            controllerItem.path = apiHelper.checkPath(opt.path);
        }
        else {
            controllerItem.path = apiHelper.mergePaths(opt.path, controllerItem.path);
        }
        if (httpSigner.is(classRef.creator, 'http.app')) {
            this.pool.controller.pendingControllers.delete(attachedRef);
            this.pool.application.item
                .controllers.set(attachedRef, this.newItem(controllerItem));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');

            this.logger.deploy.$info(FQN, 406, {
                message: 'Application attached a controller',
                host: classRef.name,
                attached: attachedRef.name,
            });
            return;
        }
        if (httpSigner.is(classRef.creator, 'http.controller')) {
            const controllerItem = this.pool.controller.allClasses.get(classRef);
            if (!controllerItem) {
                throw $dev.developerError2(FQN, 407, {
                    issue: 'Host class is not in controller list',
                    host: classRef.name,
                    attached: attachedRef.name
                });
            }
            this.pool.controller.pendingControllers.delete(attachedRef);
            controllerItem
                .controllers.set(attachedRef, this.newItem(controllerItem));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');

            this.logger.deploy.$info(FQN, 408, {
                message: 'Controller attached an another controller',
                host: classRef.name,
                attached: attachedRef.name,
            });
            return;
        }
        throw $dev.developerError2(FQN, 409, {
            issue: 'Host class is not in controller or app list',
            host: classRef.name,
            attached: attachedRef.name
        });
    }

    protected _attachWithField(fieldRef: PropertyReflectionLike, ins: DecoInstanceLike): void {
        const classRef = fieldRef.clazz;
        if (httpSigner.is(classRef.creator, 'http.ignored')) {
            return;
        }
        const opt = ins.getValue<AttachSubControllerOpt>();
        // attached is ignored
        if (httpSigner.is(opt.controller, 'http.ignored')) {
            this.logger.deploy.$warning(FQN, 450, {
                message: 'Attached controller is ignored',
                host: classRef.name,
                attached: opt.controller.name,
            });
            return;
        }

        const attachedRef = reflectionPool.get(opt.controller, false);
        if (!attachedRef) {
            throw $dev.developerError2(FQN, 451, {
                issue: 'Attached class is not reflected',
                host: classRef.name,
                attached: opt.controller.name
            });
        }
        if (attachedRef === classRef) {
            throw $dev.developerError2(FQN, 452, {
                issue: 'Host class attached itself, circular usage',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.is(attachedRef.creator, 'http.ignored')) { // any proxy case
            return;
        }
        if (!httpSigner.is(attachedRef.creator, 'http.controller')) {
            throw $dev.developerError2(FQN, 453, {
                issue: 'Attached class is not signed as a controller',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.isExt(attachedRef.creator, 'http.attached')) {
            throw $dev.developerError2(FQN, 454, {
                issue: 'Attached is already signed as attached',
                host: classRef.name,
                attached: attachedRef.name
            });
        }

        const controllerItem = this.pool.controller.allClasses.get(attachedRef);
        if (!controllerItem) {
            throw $dev.developerError2(FQN, 455, {
                issue: 'Attached class is not in controller list',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (opt.invalidatePath) {
            controllerItem.path = apiHelper.checkPath(opt.path);
        }
        else {
            controllerItem.path = apiHelper.mergePaths(opt.path, controllerItem.path);
        }
        if (httpSigner.is(classRef.creator, 'http.app')) {
            this.pool.controller.pendingControllers.delete(attachedRef);
            this.pool.application.item
                .controllers.set(attachedRef, this.newItem(controllerItem, fieldRef));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');
            if (!this.attachedFields.has(fieldRef)) {
                this.attachedFields.add(fieldRef);
                httpSigner.appendExt(fieldRef, 'http-attached-field');
            }

            this.logger.deploy.$info(FQN, 456, {
                message: 'Application attached a controller',
                host: classRef.name,
                attached: attachedRef.name, desc: ins.description,
            });
            return;
        }
        if (httpSigner.is(classRef.creator, 'http.controller')) {
            const controllerItem = this.pool.controller.allClasses.get(classRef);
            if (!controllerItem) {
                throw $dev.developerError2(FQN, 457, {
                    issue: 'Host class is not in controller list',
                    host: classRef.name,
                    attached: attachedRef.name
                });
            }
            this.pool.controller.pendingControllers.delete(attachedRef);
            controllerItem
                .controllers.set(attachedRef, this.newItem(controllerItem, fieldRef));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');
            if (!this.attachedFields.has(fieldRef)) {
                this.attachedFields.add(fieldRef);
                httpSigner.appendExt(fieldRef, 'http-attached-field');
            }
            this.logger.deploy.$info(FQN, 458, {
                message: 'Controller attached an another controller',
                host: classRef.name,
                attached: attachedRef.name, desc: ins.description,
            });
            return;
        }
        throw $dev.developerError2(FQN, 459, {
            issue: 'Host class is not in controller or app list',
            host: classRef.name,
            attached: attachedRef.name,
            desc: ins.description
        });
    }
    printDeploy(): void {}
}
