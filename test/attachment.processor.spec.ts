import {strict as assert} from 'assert';
import {describe, it} from "node:test";
import {$deploy, $test} from "@leyyo/common";
import {Fqn, reflectionPool} from "@leyyo/core";

import {apiPool, AttachController, Controller, HttpApp, IgnoreControllers} from "../src";
import {FQN} from "../src/internal";

describe('4** >> Attachment', () => {
    describe('40* >> Class', () => {
        it($test.title(400, '[w] Attached controller is ignored'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.doesNotThrow(() => {


                @Controller('users')
                class Controller400 {

                }


                @AttachController(Controller400)
                @Controller('root')
                class Class400A {
                }

                @IgnoreControllers(Controller400)
                @HttpApp()
                class App400 {

                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();

                assert.equal($deploy.has(FQN, 400), 'warning');
            });
        });
        it($test.title(401, '[e] Attached class is not reflected'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    class Controller401 {

                    }


                    @AttachController(Controller401)
                    @Controller('root')
                    class Class401A {
                    }

                    @HttpApp()
                    class App401 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 401));
                    return true;
                });
        });
        it($test.title(402, '[e] Host class attached itself, circular usage'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @AttachController(Class402)
                    @Controller('root')
                    class Class402 {
                    }

                    @HttpApp()
                    class App401 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 402));
                    return true;
                });
        });
        it($test.title(403, '[e] Attached class is not signed as a controller'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Fqn(FQN)
                    class Class403Attached {
                    }

                    @AttachController(Class403Attached)
                    @Controller('root')
                    class Class403 {
                    }

                    @HttpApp()
                    class App403 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 403));
                    return true;
                });
        });
        it($test.title(404, '[e] Attached is already signed as attached'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class404Attached {
                    }

                    @AttachController(Class404Attached)
                    @Controller('root')
                    class Class404A {
                    }

                    @AttachController(Class404Attached)
                    @Controller('root-2')
                    class Class404B {
                    }

                    @HttpApp()
                    class App404 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 404));
                    return true;
                });
        });
        it($test.title(405, '[e] Attached class is not in controller list'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class405Attached {
                    }

                    @AttachController(Class405Attached)
                    @Controller('root')
                    class Class405 {
                    }

                    @HttpApp()
                    class App405 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.controller.allClasses.delete(reflectionPool.get(Class405Attached, false)); // hack
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 405));
                    return true;
                });
        });
        it($test.title(406, '[s] Application attached a controller'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.doesNotThrow(() => {


                @Controller('users')
                class Class406Attached {
                }

                @AttachController(Class406Attached)
                @HttpApp()
                class App406 {

                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();

                assert.equal($deploy.has(FQN, 406), 'info');
            });
        });
        it($test.title(407, '[e] Host class is not in controller list'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class407Attached {
                    }

                    @AttachController(Class407Attached)
                    @Controller('root')
                    class Class407 {
                    }

                    @HttpApp()
                    class App407 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.controller.allClasses.delete(reflectionPool.get(Class407, false)); // hack
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 407));
                    return true;
                });
        });
        it($test.title(408, '[s] Controller attached an another controller'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.doesNotThrow(() => {


                @Controller('users')
                class Class408Attached {
                }

                @AttachController(Class408Attached)
                @Controller()
                class Controller408 {

                }

                @HttpApp()
                class App408 {

                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();

                assert.equal($deploy.has(FQN, 408), 'info');
            });
        });
        it($test.title(409, '[e] Host class is not in controller or app list'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class409Attached {
                    }

                    @AttachController(Class409Attached)
                    class Class409 {
                    }

                    @HttpApp()
                    class App409 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.controller.allClasses.delete(reflectionPool.get(Class409, false)); // hack
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 409));
                    return true;
                });
        });
    });

    describe('45* >> Field', () => {
        it($test.title(450, '[w] Attached controller is ignored'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.doesNotThrow(() => {


                @Controller('users')
                class Controller450 {

                }


                @Controller('root')
                class Class450A {
                    // @ts-ignore
                    @AttachController(Controller450)
                    field: string;
                }

                @IgnoreControllers(Controller450)
                @HttpApp()
                class App450 {

                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();

                assert.equal($deploy.has(FQN, 450), 'warning');
            });
        });
        it($test.title(451, '[e] Attached class is not reflected'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    class Controller451 {

                    }


                    @Controller('root')
                    class Class451A {
                        // @ts-ignore
                        @AttachController(Controller451)
                        field: string;
                    }

                    @HttpApp()
                    class App451 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 451));
                    return true;
                });
        });
        it($test.title(452, '[e] Host class attached itself, circular usage'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('root')
                    class Class452 {
                        // @ts-ignore
                        @AttachController(Class452)
                        field: string;
                    }

                    @HttpApp()
                    class App451 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 452));
                    return true;
                });
        });
        it($test.title(453, '[e] Attached class is not signed as a controller'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Fqn(FQN)
                    class Class453Attached {
                    }

                    @Controller('root')
                    class Class453 {
                        // @ts-ignore
                        @AttachController(Class453Attached)
                        field: string;
                    }

                    @HttpApp()
                    class App453 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 453));
                    return true;
                });
        });
        it($test.title(454, '[e] Attached is already signed as attached'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class454Attached {
                    }

                    @Controller('root')
                    class Class454A {
                        // @ts-ignore
                        @AttachController(Class454Attached)
                        field: string;
                    }

                    @Controller('root-2')
                    class Class454B {
                        // @ts-ignore
                        @AttachController(Class454Attached)
                        field: string;
                    }

                    @HttpApp()
                    class App454 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 454));
                    return true;
                });
        });
        it($test.title(455, '[e] Attached class is not in controller list'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class455Attached {
                    }

                    @Controller('root')
                    class Class455 {
                        // @ts-ignore
                        @AttachController(Class455Attached)
                        field: string;
                    }

                    @HttpApp()
                    class App455 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.controller.allClasses.delete(reflectionPool.get(Class455Attached, false)); // hack
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 455));
                    return true;
                });
        });
        it($test.title(456, '[s] Application attached a controller'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.doesNotThrow(() => {


                @Controller('users')
                class Class456Attached {
                }

                @HttpApp()
                class App456 {
                    // @ts-ignore
                    @AttachController(Class456Attached)
                    field: string;
                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();

                assert.equal($deploy.has(FQN, 456), 'info');
            });
        });
        it($test.title(457, '[e] Host class is not in controller list'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class457Attached {
                    }

                    @Controller('root')
                    class Class457 {
                        // @ts-ignore
                        @AttachController(Class457Attached)
                        field: string;
                    }

                    @HttpApp()
                    class App457 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.controller.allClasses.delete(reflectionPool.get(Class457, false)); // hack
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 457));
                    return true;
                });
        });
        it($test.title(458, '[s] Controller attached an another controller'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.doesNotThrow(() => {


                @Controller('users')
                class Class458Attached {
                }

                @Controller()
                class Controller458 {
                    // @ts-ignore
                    @AttachController(Class458Attached)
                    field: string;
                }

                @HttpApp()
                class App458 {

                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();

                assert.equal($deploy.has(FQN, 458), 'info');
            });
        });
        it($test.title(459, '[e] Host class is not in controller or app list'), () => {
            // $test.$secure.$ok();
            apiPool.clear();

            assert.throws(() => {


                    @Controller('users')
                    class Class459Attached {
                    }

                    class Class459 {
                        // @ts-ignore
                        @AttachController(Class459Attached)
                        field: string;
                    }

                    @HttpApp()
                    class App459 {

                    }

                    apiPool.ignore.fetchClasses();
                    apiPool.application.fetchClasses();
                    apiPool.controller.fetchClasses();
                    apiPool.controller.allClasses.delete(reflectionPool.get(Class459, false)); // hack
                    apiPool.attachment.fetchAttachments();
                },
                error => {
                    assert.equal((error as Error).message, $test.code(FQN, 459));
                    return true;
                });
        });
    });
});
