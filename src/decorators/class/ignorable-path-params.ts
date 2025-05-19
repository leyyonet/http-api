import {$assert, $dev} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {FQN_PCK} from "../../internal";

export interface IgnorablePathParamsOpt {
    params: Array<string>;
}

/**
 * Indicates paths params (used as :name) are ignorable, and processor won't throw any error if they are not used in path parameters
 * It can be used for controller {@Controller} or application {@HttpApp}
 *
 * @param {Array<string>} params - names can be ignored
 *
 * */
export function IgnorablePathParams(...params: Array<string>): ClassDecorator {
    return clazz =>
        id.process([clazz], {params});
}

const id = decoratorPool.newId<IgnorablePathParamsOpt>(IgnorablePathParams)
    .fqn(FQN_PCK)
    .targets('class')
    .keywords('api')
    .processor((ins, p) => {
        $assert.textArray(p.params, () => $dev.desc(ins, {field: 'params'}));
        ins.set(p);

    });
