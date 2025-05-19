import {$assert, $dev, ClassLike} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";

export interface AttachSubControllerOpt {
    controller: ClassLike;
    path: string|RegExp;
    invalidatePath?: boolean;
}

/**
 * Attaches a sub controller to a controller or sub controller
 * Annotated class should be annotated by {@Controller} or {@SubController}
 *
 * @param {ClassLike} controller - Class of sub controller, it should be annotated by {@SubController}
 * @param {string} path - context path for sub controller
 * @param {boolean} invalidatePath - If yes, sub controller's path will be cleared
 *
 * */
export function AttachController(controller: ClassLike, path?: string|RegExp, invalidatePath?: boolean): ClassDecorator;
export function AttachController(controller: ClassLike, path?: string|RegExp, invalidatePath?: boolean): PropertyDecorator;
export function AttachController(controller: ClassLike, path?: string|RegExp, invalidatePath?: boolean): ClassDecorator | PropertyDecorator {
    return (clazz: object, property: PropertyKey): void =>
        id.process([clazz, property], {controller, path, invalidatePath});
}

const id = decoratorPool.newId<AttachSubControllerOpt>(AttachController)
    .fqn(FQN_PCK)
    .targets('class', 'field')
    .keywords('api')
    .processor((ins, p) => {
        $assert.func(p.controller, () => $dev.desc(ins, {field: 'controller'}));
        if (!(p.path instanceof RegExp)) {
            $assert.textOptional(p.path, () => $dev.desc(ins, {field: 'path'}));
        }
        $assert.booleanOptional(p.invalidatePath, () => $dev.desc(ins, {field: 'invalidatePath'}));
        ins.set(p);

    });
