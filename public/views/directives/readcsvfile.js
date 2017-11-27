"use strict";

(function(){
    angular
        .module("csvDirectives", [])
        .directive("readCsvFile", readCsvFile);

    function readCsvFile() {
        function link(scope, element) {
            var config = {
                delimiter: "",	// auto-detect
                newline: "",	// auto-detect
                quoteChar: '"',
                header: true,
                dynamicTyping: false,
                preview: 0,
                encoding: "",
                worker: false,
                comments: false,
                step: undefined,
                complete: undefined,
                error: undefined,
                download: false,
                skipEmptyLines: false,
                chunk: undefined,
                fastMode: undefined,
                beforeFirstChunk: undefined,
                withCredentials: undefined
            };

            $(element).on('change', function(changeEvent) {
                var files = changeEvent.target.files;
                if (files.length) {
                    var r = new FileReader();
                    r.onload = function(e) {
                        var contents = e.target.result;
                        scope.$apply(function () {
                            console.log("In here");
                            scope.readCsvFile = Papa.parse(contents,config).data;
                            //scope.readCsvFile = contents;
                        });
                    };

                    r.readAsText(files[0]);
                }
            });
        }
        return {
            link: link,
            scope: {
                readCsvFile:"="
            }
        };
    }
    //    .directive('fileReader', function() {
    //        return {
    //            scope: {
    //                fileReader:"="
    //            },
    //            link: function(scope, element) {
    //                $(element).on('change', function(changeEvent) {
    //                    var files = changeEvent.target.files;
    //                    if (files.length) {
    //                        var r = new FileReader();
    //                        r.onload = function(e) {
    //                            var contents = e.target.result;
    //                            scope.$apply(function () {
    //                                scope.fileReader = contents;
    //                                //scope.testing = contents;
    //                            });
    //                        };
    //
    //                        r.readAsText(files[0]);
    //                    }
    //                });
    //            }
    //        };
    //    });
})();