"use strict";

(function () {

    angular
        .module("TaPortal")
        .controller("StableMatchController",StableMatchController);

    function StableMatchController($location, PositionService, UserService, applicationsService, $rootScope) {

        var vm = this;

        var positionDetails = new buckets.Dictionary();
        var positionProfId = new buckets.Dictionary();
        var positionStudentsSorted = new buckets.Dictionary();
        var positionStudentsUnsorted = new buckets.Dictionary();
        var positionLastStudentIndex = new buckets.Dictionary();
        var positionFilledByStudents = new buckets.Dictionary();

        var studentsDetail = new buckets.Dictionary();
        var studentBestMatch = new buckets.Dictionary();
        var studentPositionsPref = new buckets.Dictionary();
        var studentAssignment = new buckets.Dictionary();


        init();

        var findStudentPrefAndPosAppln = function(application, doneCallback) {
            UserService
                .findUserById(application._user)
                .then(function (response) {
                    if(response) {
                        var studentDetails = response.data;
                        var profRating = 2;

                        for(var k = 0; k < studentDetails.rating.length; k++) {
                            console.log("In here");
                            if(studentDetails["rating"][k]._user == positionProfId.get(application._position)) {
                                profRating = studentDetails["rating"][k].rating;
                                break;
                            }
                        }
                        studentDetails["rating"] = profRating;

                        //var studentsApplied = positionStudentsUnsorted.get(application._position);
                        //studentsApplied.push(studentDetails);
                        //positionStudentsUnsorted.set(application._position,studentsApplied);

                        positionStudentsUnsorted.get(application._position).push(studentDetails);

                        if(!studentPositionsPref.containsKey(studentDetails._id)) {
                            var studentApplications = [];

                            studentBestMatch.set(studentDetails._id,false);
                            studentAssignment.set(studentDetails._id,null);
                            studentsDetail.set(studentDetails._id,studentDetails)

                            applicationsService
                                .findApplicationForUser(studentDetails._id)
                                .then(function (response) {
                                    if(response) {
                                        studentApplications = response.data;
                                        studentApplications.sort(function(a, b){return a.priority - b.priority});

                                        var studentPositionPrefSorted = [];

                                        for(var l = 0; l < studentApplications.length; l++) {
                                            studentPositionPrefSorted.push(studentApplications[l]._position);
                                        }
                                        studentPositionsPref.set(studentDetails._id,studentPositionPrefSorted);
                                        // return doneCallback(null);
                                    } else {
                                        console.log("No applications for student found");
                                    }
                                }, function (error) {
                                    console.log("Cannot find applications for student: "+ error);
                                });
                        }
                    } else {
                        console.log("No student found");
                    } return doneCallback(null);
                }, function (error) {
                    console.log("Cannot find student: "+ error);
                });
        }

        var findProfDetails = function(position, doneCallback) {

            positionDetails.set(position._id,position);
            positionLastStudentIndex.set(position._id,-1);
            positionStudentsUnsorted.set(position._id,[]);
            positionFilledByStudents.set(position._id,[]);
            // find professor id
            UserService
                .findUserByUsername(position.username)
                .then(function (response) {
                    if(response) {
                        var professorDetails = response.data;
                        positionProfId.set(position._id,professorDetails._id);

                        /////////////////////////////////////////////////////////////////////////////////////
                        applicationsService
                            .getApplicationsForPosition(position._id)
                            .then(function (response) {
                                if(response) {
                                    var positionApplications = response.data;
                                    // Now get students from application and sort them based on rating and
                                    // individual preference of students
                                    async.each(positionApplications, findStudentPrefAndPosAppln, function (response) {
                                        // findProfDetails has been called on each of the positions
                                        // so we're now done!
                                        var studentsForPosition = positionStudentsUnsorted.get(position._id);
                                        studentsForPosition.sort(function(a, b){return b.rating - a.rating});
                                        var studentIdForPositionSorted = [];
                                        for(var m = 0; m < studentsForPosition.length; m++) {
                                            studentIdForPositionSorted.push(studentsForPosition[m]._id);
                                        }
                                        positionStudentsSorted.set(position._id, studentIdForPositionSorted);
                                        console.log("Finished!!!!");
                                        return doneCallback(null);
                                    });
                                    //return doneCallback(null);
                                } else {
                                    console.log("No application found for position");
                                } //return doneCallback(null);
                            }, function (error) {
                                console.log("Cannot find applications for position: "+ error);
                            });

                        //////////////////////////////////////////////////////////////////////////////

                    } else {
                        console.log("No professor found");
                    }
                }, function (error) {
                    console.log("Cannot find professor: "+ error);
                });
        }

        function updatePositionsAndStudents() {
            PositionService
                .findAllPositions()
                .then(function (response) {
                    if(response) {
                        var positionsCreated = response.data;

                        // Once all positions found, update respective maps
                        async.each(positionsCreated, findProfDetails, function (response) {
                            // findProfDetails has been called on each of the positions
                            // so we're now done!
                            //console.log(positionStudentsSorted.keys());
                            console.log(positionStudentsSorted.values());
                            console.log("Finished!");

                            computeStableMatching();
                        });
                    } else {
                        console.log("No positions created");
                    }
                }, function (error) {
                    console.log("Cannot find all positions: "+ error);
                });
        }

        // Get all positions
        // individual positions -> get applications
        function init(){
            updatePositionsAndStudents();
        }

        function computeStableMatching() {
            var allPositionsNotOccupied = true;
            //var allApplnsForPositionsNotConsidered = true;

            while(allPositionsNotOccupied) {
                //console.log("positionFilledByStudents");
                //console.log(positionFilledByStudents.values());
                //console.log("positionDetails");
                //console.log(positionDetails.keys());
                for(var k = 0; k < positionDetails.keys().length; k++) {
                //for(position in positionDetails.keys()) {

                    var position = positionDetails.keys()[k];
                    //console.log("Position Variable");
                    //console.log(position);
                    var positionsFilled = positionFilledByStudents.get(position).length;
                    //console.log("positionsFilled");
                    //console.log(positionsFilled);
                    if(positionsFilled < positionDetails.get(position).number) {
                        if(positionLastStudentIndex.get(position) < positionStudentsSorted.get(position).length - 1) {
                           var indexOfStudentToBeConsidered = positionLastStudentIndex.get(position) + 1;
                            positionLastStudentIndex.set(position,indexOfStudentToBeConsidered);
                            var consideredStudentId = positionStudentsSorted.get(position)[indexOfStudentToBeConsidered];
                            if(studentAssignment.get(consideredStudentId) == null) {
                                studentAssignment.set(consideredStudentId, position);
                                positionFilledByStudents.get(position).push(consideredStudentId);
                            } else {
                                if(studentAssignment.get(consideredStudentId) != position) {
                                    var priorityCurPos = studentPositionsPref.get(consideredStudentId).indexOf(position);
                                    var priorityOtherPos = studentPositionsPref.get(consideredStudentId)
                                        .indexOf(studentAssignment.get(consideredStudentId));

                                    if(!studentBestMatch.get(consideredStudentId)) {
                                        if(priorityCurPos < priorityOtherPos) {
                                            positionFilledByStudents.get(position).push(consideredStudentId);
                                            //var updateCurPositionList = positionFilledByStudents.get(position).push(consideredStudentId);
                                            // positionFilledByStudents.set(position,updateCurPositionList);

                                            var indexToBeDeleted = positionFilledByStudents.get(studentAssignment.get(consideredStudentId))
                                                .indexOf(consideredStudentId);

                                            positionFilledByStudents.get(studentAssignment.get(consideredStudentId))
                                                .splice(indexToBeDeleted,1);

                                            studentAssignment.set(consideredStudentId,position);
                                        }

                                        if(priorityCurPos == 0) {
                                            studentBestMatch.set(consideredStudentId,true);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    console.log("In here");
                }

                //var student;
                //var studentPreferenceSatisfied = false;
                //for(student in studentBestMatch.keys()) {
                //    if(!studentBestMatch.get(student)) {
                //        studentPreferenceSatisfied = true;
                //    }
                //}

                var count = positionDetails.size();
                for(var l = 0; l < positionDetails.keys().length; l++) {
                    var position = positionDetails.keys()[l];
                //for(position in positionDetails.keys()) {
                    // position filled or not filled but reached end of applications
                    if((positionFilledByStudents.get(position).length == positionDetails.get(position).number) ||
                        ((positionFilledByStudents.get(position).length != positionDetails.get(position).number) &&
                        (positionLastStudentIndex.get(position)+1 == positionStudentsSorted.get(position).length))) {
                        count = count - 1;
                    }
                }
                if(count == 0) {
                    allPositionsNotOccupied = false;
                }
            }

            console.log("Final assignment");
            console.log(positionFilledByStudents.keys());
            console.log(positionFilledByStudents.values());
            console.log(positionLastStudentIndex.values());

            displayMatchingResults();
        }

        function displayMatchingResults() {
            var positionStudentMappings = [];
            for(var i = 0; i < positionDetails.keys().length; i++) {
                var positionStudentMapping = {};
                positionStudentMapping["pos"] = positionDetails.get(positionDetails.keys()[i]);
                var students = [];
                for(var j = 0; j < positionFilledByStudents.get(positionStudentMapping["pos"]._id).length ; j++) {
                    students.push(studentsDetail.get(positionFilledByStudents.get(positionStudentMapping["pos"]._id)[j]));
                }
                positionStudentMapping["students"] = students;
                positionStudentMappings.push(positionStudentMapping);
            }

            $rootScope.finalData = positionStudentMappings;
        }

        vm.logout = logout;

        function logout() {
            UserService
                .logout()
                .then(
                    function (response) {
                        $location.url("/login");
                    },
                    function (error) {
                        $location.url("/login");
                    }
                );
        }
    }})();