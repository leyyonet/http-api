import {AttachmentItem, AttachmentProcessorLike} from "./index.types";
import {ApiPoolLike} from "../pool";
import {
    ClassReflectionLike,
    DecoInstanceLike,
    decoratorPool, lifecycle,
    PropertyReflectionLike,
    reflectionPool
} from "@leyyo/core";
import {AttachController, AttachSubControllerOpt} from "../decorators";
import {$descriptor, $dev, $log, $repo} from "@leyyo/common";
import {httpSigner} from "@leyyo/http";
import {FQN_PCK} from "../internal";
import {ControllerItem} from "../controller";

export class AttachmentProcessor implements AttachmentProcessorLike {
    private readonly logger = $log.create(AttachmentProcessor);
    attachedFields: Set<PropertyReflectionLike>;

    constructor(private pool: ApiPoolLike) {
        this.attachedFields = $repo.newSet(FQN_PCK, 'attachedFields');
    }

    newItem(item: ControllerItem, path: string|RegExp, fieldRef?: PropertyReflectionLike): AttachmentItem {
        return {item, fieldRef, path} as AttachmentItem;
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
            lifecycle.addWarning(FQN_PCK, 400, {
                message: 'Attached controller is ignored',
                host: classRef.name,
                attached: opt.controller.name,
            });
            return;
        }

        const attachedRef = reflectionPool.get(opt.controller, false);
        if (!attachedRef) {
            throw $dev.developerError2(FQN_PCK, 401, {
                issue: 'Attached class is not reflected',
                host: classRef.name,
                attached: opt.controller.name
            });
        }
        if (attachedRef === classRef) {
            throw $dev.developerError2(FQN_PCK, 402, {
                issue: 'Host class attached itself, circular usage',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.is(attachedRef.creator, 'http.ignored')) { // any proxy case
            return;
        }
        if (!httpSigner.is(attachedRef.creator, 'http.controller')) {
            throw $dev.developerError2(FQN_PCK, 403, {
                issue: 'Attached class is not signed as a controller',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.isExt(attachedRef.creator, 'http.attached')) {
            throw $dev.developerError2(FQN_PCK, 404, {
                issue: 'Attached is already signed as attached',
                host: classRef.name,
                attached: attachedRef.name
            });
        }

        const attachedItem = this.pool.controller.allClasses.get(attachedRef);
        if (!attachedItem) {
            throw $dev.developerError2(FQN_PCK, 405, {
                issue: 'Attached class is not in controller list',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (opt.invalidatePath) {
            attachedItem.path = opt.path;
            opt.path = undefined;
        }
        if (httpSigner.is(classRef.creator, 'http.app')) {
            this.pool.controller.pendingControllers.delete(attachedRef);
            this.pool.application.item
                .controllers.set(attachedRef, this.newItem(attachedItem, opt.path));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');

            lifecycle.addInfo(FQN_PCK, 406, {
                message: 'Application attached a controller',
                host: classRef.name,
                attached: attachedRef.name,
            });
            return;
        }
        if (httpSigner.is(classRef.creator, 'http.controller')) {
            const controllerItem = this.pool.controller.allClasses.get(classRef);
            if (!controllerItem) {
                throw $dev.developerError2(FQN_PCK, 407, {
                    issue: 'Host class is not in controller list',
                    host: classRef.name,
                    attached: attachedRef.name
                });
            }
            this.pool.controller.pendingControllers.delete(attachedRef);
            controllerItem
                .controllers.set(attachedRef, this.newItem(attachedItem, opt.path));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');

            lifecycle.addInfo(FQN_PCK, 408, {
                message: 'Controller attached an another controller',
                host: classRef.name,
                attached: attachedRef.name,
            });
            return;
        }
        throw $dev.developerError2(FQN_PCK, 409, {
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
            lifecycle.addWarning(FQN_PCK, 450, {
                message: 'Attached controller is ignored',
                host: classRef.name,
                attached: opt.controller.name,
            });
            return;
        }

        const attachedRef = reflectionPool.get(opt.controller, false);
        if (!attachedRef) {
            throw $dev.developerError2(FQN_PCK, 451, {
                issue: 'Attached class is not reflected',
                host: classRef.name,
                attached: opt.controller.name
            });
        }
        if (attachedRef === classRef) {
            throw $dev.developerError2(FQN_PCK, 452, {
                issue: 'Host class attached itself, circular usage',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.is(attachedRef.creator, 'http.ignored')) { // any proxy case
            return;
        }
        if (!httpSigner.is(attachedRef.creator, 'http.controller')) {
            throw $dev.developerError2(FQN_PCK, 453, {
                issue: 'Attached class is not signed as a controller',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (httpSigner.isExt(attachedRef.creator, 'http.attached')) {
            throw $dev.developerError2(FQN_PCK, 454, {
                issue: 'Attached is already signed as attached',
                host: classRef.name,
                attached: attachedRef.name
            });
        }

        const attachedItem = this.pool.controller.allClasses.get(attachedRef);
        if (!attachedItem) {
            throw $dev.developerError2(FQN_PCK, 455, {
                issue: 'Attached class is not in controller list',
                host: classRef.name,
                attached: attachedRef.name
            });
        }
        if (opt.invalidatePath) {
            attachedItem.path = opt.path;
            opt.path = undefined;
        }
        if (httpSigner.is(classRef.creator, 'http.app')) {
            this.pool.controller.pendingControllers.delete(attachedRef);
            this.pool.application.item
                .controllers.set(attachedRef, this.newItem(attachedItem, opt.path, fieldRef));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');
            if (!this.attachedFields.has(fieldRef)) {
                this.attachedFields.add(fieldRef);
                httpSigner.appendExt(fieldRef, 'http-attached-field');
            }

            lifecycle.addInfo(FQN_PCK, 456, {
                message: 'Application attached a controller',
                host: classRef.name,
                attached: attachedRef.name, desc: ins.description,
            });
            return;
        }
        if (httpSigner.is(classRef.creator, 'http.controller')) {
            const controllerItem = this.pool.controller.allClasses.get(classRef);
            if (!controllerItem) {
                throw $dev.developerError2(FQN_PCK, 457, {
                    issue: 'Host class is not in controller list',
                    host: classRef.name,
                    attached: attachedRef.name
                });
            }
            this.pool.controller.pendingControllers.delete(attachedRef);
            controllerItem
                .controllers.set(attachedRef, this.newItem(attachedItem, opt.path, fieldRef));
            httpSigner.appendExt(attachedRef.creator, 'http.attached');
            if (!this.attachedFields.has(fieldRef)) {
                this.attachedFields.add(fieldRef);
                httpSigner.appendExt(fieldRef, 'http-attached-field');
            }
            lifecycle.addInfo(FQN_PCK, 458, {
                message: 'Controller attached an another controller',
                host: classRef.name,
                attached: attachedRef.name, desc: ins.description,
            });
            return;
        }
        throw $dev.developerError2(FQN_PCK, 459, {
            issue: 'Host class is not in controller or app list',
            host: classRef.name,
            attached: attachedRef.name,
            desc: ins.description
        });
    }

}
