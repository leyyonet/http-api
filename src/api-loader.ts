import {Fqn} from "@leyyo/core";
import {Loader} from "@leyyo/injection";
import {FQN} from "./internal";
import {apiPool} from "./pool";

@Loader(apiPool)
@Fqn(FQN)
export class ApiLoader {

}
