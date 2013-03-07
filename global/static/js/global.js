define(['routers/main'], function(Router) {
    var router;
    var initialize = function() {
        router = new Router();
    };

    return {
        'initialize': initialize,
        'router': router
    };
});
