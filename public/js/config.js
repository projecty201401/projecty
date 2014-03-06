require.config({
    "deps": ["app"],
    "paths": {
	"lodash": "../lib/lodash.min",
    "angular": "../lib/angular.min",
    "ngRoute": "../lib/angular-route.min"
    },
    
    "shim": {
        "ngRoute": {
            "deps": [
                "angular"
            ],
            exports: "ngRoute"
        }
    }
});
