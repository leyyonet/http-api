import e from "express";

export interface RouterProcessorLike {
    printDeploy(): void;
}

export interface RouterItem {
    router: e.Router;
    fullPath: string;
    path: string|RegExp;
}
