import {strict as assert} from 'assert';
import {$deploy, $test} from "@leyyo/common";

import {apiPool, HttpApp, IgnoreControllers} from "../src";

import {FQN} from "../src/internal";

describe('10* >> Application', () => {
    it($test.title(100, '[i] Ignored application should not be evaluated'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App100 {

                }

                @IgnoreControllers(App100)
                class Class100A {
                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 103)); // after info
                assert.equal($deploy.has(FQN, 100), 'info');
                return true;
            });
    });
    it($test.title(101, '[e] Multiple application is defined'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App101A {

                }

                @HttpApp()
                class Class101B {
                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 101));
                return true;
            });
    });
    it($test.title(102, '[s] Application is found'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

                @HttpApp()
                class App102 {

                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();

            assert.equal($deploy.has(FQN, 102), 'info');
            });
    });
    it($test.title(103, '[e] There is not any application which is defined'), () => {
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App100 {

                }

                @IgnoreControllers(App100)
                class Class100A {
                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 103));
                return true;
            });
    });
});
