export interface ApiHelperLike {
    mergePaths(parentPath: string|RegExp, path: string | RegExp): string | RegExp;
    plainPaths(parentPath: string|RegExp, path: string | RegExp): string;
    checkPath(path: string|RegExp): string|RegExp;
    plainPath(path: string|RegExp): string;
}
