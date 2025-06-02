import {$assert, $dev} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {Provider} from "@leyyo/injection";
import {FQN} from "../../internal";

export interface HttpAppOpt {
    contextPath: string|RegExp;
}

/**
 * Indicates that this class is an application
 *
 * Notes:
 * - Annotated class should not be annotated by {@Provider} again, because it will be added automatically
 *
 * @param {string} contextPath - context path for application
 *
 * */
export function HttpApp(contextPath?: string|RegExp): ClassDecorator {
    return clazz => id.process([clazz], {contextPath});
}

const idProvider = decoratorPool.getIdentifier(Provider);
const id = decoratorPool.newId<HttpAppOpt>(HttpApp)
    .fqn(FQN)
    .targets('class')
    .rules('no-inherited', 'no-multiple')
    .keywords('api')
    .processor((ins, p) => {
        idProvider.process(ins, {});
        if (!(p.contextPath instanceof RegExp)) {
            $assert.textOptional(p.contextPath, () => $dev.desc(ins, {field: 'contextPath'}));
        }
        ins.set(p);
    });
