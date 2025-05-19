import {Body} from "./body";
import {AsContext} from "./as-context";
import {AsCtx} from "./as-ctx";
import {File} from "./file";
import {Header} from "./header";
import {Headers} from "./headers";
import {Param} from "./param";
import {Params} from "./params";
import {Prm} from "./prm";
import {Qry} from "./qry";
import {Queries} from "./queries";
import {Query} from "./query";
import {AsReq} from "./as-req";
import {AsRequest} from "./as-request";
import {AsRes} from "./as-res";
import {AsResponse} from "./as-response";
import {Files} from "./files";
import {Cookie} from "./cookie";
import {Cookies} from "./cookies";
import {Payload} from "./payload";
import {AsApp} from "./as-app";

export const $$apiParameterDecorators = [AsApp, Body, Payload, AsContext, Cookie, Cookies, AsCtx,
    File, Files, Header, Headers,
    Param, Params, Prm, Qry, Queries, Query, AsReq, AsRequest, AsRes, AsResponse];
