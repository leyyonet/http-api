import {Fqn} from "@leyyo/core";
import {Loader} from "@leyyo/injection";

import {FQN} from "./internal";
import {$$apiParameterDecorators} from "./decorators/parameter/internal.loader";
import {$$apiClassDecorators} from "./decorators/class/internal.loader";

@Loader(...$$apiClassDecorators, ...$$apiParameterDecorators)
@Fqn(FQN)
export class ApiDecorators {

}
