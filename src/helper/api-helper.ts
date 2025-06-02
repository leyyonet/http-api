import {Fqn} from "@leyyo/core";

import {ApiHelperLike} from "./index.types";
import {FQN} from "../internal";

@Fqn(FQN)
class ApiHelper implements ApiHelperLike {

    plainPaths(parentPath: string|RegExp, path: string | RegExp): string {
        return this.plainPath(this.mergePaths(parentPath, path));
    }
    mergePaths(parentPath: string|RegExp, path: string | RegExp): string | RegExp {
        if (parentPath === undefined) {
            if (path === undefined) {
                return '/';
            }
            return this.checkPath(path);
        }
        if (path === undefined) {
            return this.checkPath(parentPath);
        }
        return this.plainPath(parentPath) + this.plainPath(path);
    }

    checkPath(path: string|RegExp): string|RegExp {
        if (path instanceof RegExp) {
            return path;
        }
        if (typeof path === 'string') {
            path = path.trim();
            if (!path || path === '/') {
                return '/';
            }
            if (path[path.length - 1] === '/') {
              path = path.slice(0, path.length - 1);
            }
            if (path[0] !== '/') {
                path = '/' + path;
            }
            return path;
        }
        return '/';
    }
    plainPath(path: string|RegExp): string {
        if (path instanceof RegExp) {
            return this.plainPath(path.toString());
        }
        return this.checkPath(path) as string;
    }

}
export const apiHelper: ApiHelperLike = new ApiHelper();
