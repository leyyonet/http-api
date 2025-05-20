import {$assert, $dev} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {Provider} from "@leyyo/injection";

import {FQN_PCK} from "../../internal";

export interface ControllerOpt {
    path: string|RegExp;
}

/**
 * Indicates that this class is a controller
 *
 * Notes:
 * - Annotated class should not be annotated by {@SubController} again
 * - Annotated class should not be annotated by {@Provider} again, because it will be added automatically
 *
 * @param {string} path - context path for controller
 *
 * */
export function Controller(path?: string|RegExp): ClassDecorator {
    return clazz => id.process([clazz], {path});
}

const idProvider = decoratorPool.getIdentifier(Provider);
const id = decoratorPool.newId<ControllerOpt>(Controller)
    .fqn(FQN_PCK)
    .targets('class')
    .rules('no-inherited', 'no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        idProvider.process(ins, {});
        if (!(p.path instanceof RegExp)) {
            $assert.textOptional(p.path, () => $dev.desc(ins, {field: 'path'}));
        }
        ins.set(p);
    });
