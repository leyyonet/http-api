import {$assert, $dev, ClassLike} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";

export interface IgnoreControllersOpt {
    controllers: Array<ClassLike>;
}

/**
 * Ignores given controllers
 * Annotated class should be annotated by {@HttpApp}
 *
 * @param {Array<ClassLike>} controllers - Ignored controllers
 *
 * */
export function IgnoreControllers(...controllers: Array<ClassLike>): ClassDecorator {
    return clazz =>
        id.process([clazz], {controllers});
}

const id = decoratorPool.newId<IgnoreControllersOpt>(IgnoreControllers)
    .fqn(FQN_PCK)
    .targets('class')
    .keywords('api')
    .processor((ins, p) => {
        $assert.funcArray(p.controllers, () => $dev.desc(ins, {field: 'controllers'}));
        ins.set(p);

    });
