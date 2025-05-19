import {$assert, $dev} from "@leyyo/common";
import {MonoParamOpt} from "./index.types";
import {DecoInstanceLike} from "@leyyo/core";

class ParameterHelper {
    camelToKebab(str: string) {
        return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1\-').toLowerCase();
    }

    processSingle(param: MonoParamOpt, ins: DecoInstanceLike, isHeader?: boolean): MonoParamOpt {
        $assert.textOptional(param.field, () => $dev.desc(ins, {field: 'field'}));
        if (!param.field) {
            param.field = ins.asParameter.name;
            if (param.field && isHeader) {
                param.field = this.camelToKebab(param.field);
            }
        }
        return {field: param.field};
    }
}

export const helper = new ParameterHelper();
