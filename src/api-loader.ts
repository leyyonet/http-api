import {Fqn} from "@leyyo/core";
import {FQN_PCK} from "./internal";
import {apiPool} from "./pool";

@Loader(apiPool)
@Fqn(FQN_PCK)
export class ApiLoader {

}
