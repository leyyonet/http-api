import {Fqn, Loader} from "@leyyo/core";
import {FQN_PCK} from "./internal";
import {$$apiParameterDecorators} from "./decorators/parameter/internal.loader";
import {$$apiClassDecorators} from "./decorators/class/internal.loader";

@Loader(...$$apiClassDecorators, ...$$apiParameterDecorators)
@Fqn(FQN_PCK)
export class ApiDecorators {

}
