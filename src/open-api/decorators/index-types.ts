import {ClassLike, Func} from "@leyyo/common";

export type ApiDocTypeOne = string | Func | ClassLike;
export type ApiDocTypeArray = [ApiDocTypeOne];
export type ApiDocTypeRec = [ApiDocTypeOne, ApiDocTypeOne];
export type ApiDocTypeAny = ApiDocTypeOne | ApiDocTypeArray | ApiDocTypeRec;