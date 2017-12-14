"use strict";

(function () {

    angular
        .module("TaPortal")
        .controller("StableMatchController",StableMatchController);

    function StableMatchController($location, PositionService, UserService, applicationsService, AdminApplnService, $rootScope) {

        var vm = this;

        vm.publishMapping = false;
        vm.modPublishMapping = false;
        vm.showModifiedMapping = false;
        var origAdminAppln = {};

        var mappedData = [];
        var unMappedData = [];

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
                            //console.log("In here");
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
                            //console.log(positionStudentsSorted.values());
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

                    //console.log("In here");
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
            //console.log(positionFilledByStudents.keys());
            //console.log(positionFilledByStudents.values());
            //console.log(positionLastStudentIndex.values());

            displayMatchingResults();
        }

        function displayMatchingResults() {
            var positionStudentMappings = [];
            var mappings = [];
            for(var i = 0; i < positionDetails.keys().length; i++) {
                var positionStudentMapping = {};
                positionStudentMapping["pos"] = positionDetails.get(positionDetails.keys()[i]);
                var psMapping = {};
                psMapping["_position"] = positionStudentMapping["pos"]._id;
                psMapping["positionName"] = positionStudentMapping["pos"].course;
                psMapping["profUsername"] = positionStudentMapping["pos"].username;
                psMapping["professor"] = positionStudentMapping["pos"].professor;
                psMapping["number"] = positionStudentMapping["pos"].number;
                psMapping["isTracked"] = true;
                psMapping["students"] = [];
                var students = [];
                var sMapping = [];
                for(var j = 0; j < positionFilledByStudents.get(positionStudentMapping["pos"]._id).length ; j++) {
                    var studentDetail = studentsDetail.get(positionFilledByStudents.get(positionStudentMapping["pos"]._id)[j]);
                    var sDetail = {};
                    sDetail["_user"] = studentDetail._id;
                    sDetail["firstName"] = studentDetail.firstName;
                    sDetail["lastName"] = studentDetail.lastName;
                    sDetail["email"] = studentDetail.email;
                    students.push(studentDetail);
                    sMapping.push(sDetail);
                }
                positionStudentMapping["students"] = students;
                psMapping["students"] = sMapping;
                positionStudentMappings.push(positionStudentMapping);
                mappings.push(psMapping);
            }
            $rootScope.finalData = positionStudentMappings;

            ///////////////////////////////////////////////New Code////////////////////////////////////////////
            var unassignedPSMapping = {};
            unassignedPSMapping["_position"] = null;
            unassignedPSMapping["positionName"] = null;
            unassignedPSMapping["profUsername"] = null;
            unassignedPSMapping["professor"] = null;
            unassignedPSMapping["number"] = 0;
            unassignedPSMapping["isTracked"] = false;
            unassignedPSMapping["students"] = [];
            var unSMapping = [];
            for(var zz = 0; zz < studentAssignment.keys().length; zz++) {
                if(studentAssignment.get(studentAssignment.keys()[zz]) == null) {
                    var unStudentDetail = studentsDetail.get(studentAssignment.keys()[zz]);
                    var unSDetail = {};
                    unSDetail["_user"] = unStudentDetail._id;
                    unSDetail["firstName"] = unStudentDetail.firstName;
                    unSDetail["lastName"] = unStudentDetail.lastName;
                    unSDetail["email"] = unStudentDetail.email;
                    unSMapping.push(unSDetail);
                }
            }
            unassignedPSMapping["students"] = unSMapping;
            mappings.push(unassignedPSMapping);

            var originalAdminAppln = {};
            originalAdminAppln["mappings"] = mappings;

            //console.log(originalAdminAppln["mappings"]);

            AdminApplnService
                .findAdminApplnByName("original")
                .then(function(response) {
                    var adminAppln = response.data;
                    origAdminAppln = adminAppln;
                    console.log("adminAppln");
                    console.log(adminAppln);
                    if(adminAppln) {
                        //console.log("In here - update  ");
                        originalAdminAppln["name"] = adminAppln.name;
                        originalAdminAppln["isPublished"] = adminAppln.isPublished;
                        vm.publishMapping = adminAppln.isPublished;

                        AdminApplnService
                            .updateAdminAppln(adminAppln._id, originalAdminAppln)
                            .then(function(response) {
                                console.log("Updated changes, if any :"+ response.data);
                        }, function(error) {
                                console.log("Cannot update originalAdminAppln :"+ error);
                        });
                    } else {
                        originalAdminAppln["name"] = "original";
                        originalAdminAppln["isPublished"] = false;
                        vm.publishMapping = false;
                        AdminApplnService
                            .createAdminAppln(originalAdminAppln)
                            .then(function(response) {
                                console.log("Created originalAdminAppln :"+ response.data);
                            }, function(error) {
                                console.log("Cannot create originalAdminAppln :"+ error);
                            });
                    }

                    AdminApplnService
                        .findAdminApplnByName("modified")
                        .then(function(response) {
                            var modAdminAppln = response.data;
                            console.log("modAdminAppln");
                            console.log(modAdminAppln);
                            if(modAdminAppln) {
                                vm.modPublishMapping = modAdminAppln.isPublished;

                                if(modAdminAppln.mappings.length != originalAdminAppln.mappings.length) {
                                    console.log("In original mapping");
                                    modAdminAppln["mappings"] = originalAdminAppln.mappings;
                                    AdminApplnService
                                        .updateAdminAppln(modAdminAppln._id, modAdminAppln)
                                        .then(function(response) {
                                            console.log("Updated changes to modAdminAppln mappings:"+ response.data);

                                            for(var xx=0; xx < originalAdminAppln.mappings.length; xx++) {
                                                if(originalAdminAppln.mappings[xx].positionName != null) {
                                                    mappedData.push(originalAdminAppln.mappings[xx]);
                                                } else {
                                                    unMappedData.push(originalAdminAppln.mappings[xx]);
                                                }
                                            }
                                        }, function(error) {
                                            console.log("Cannot update originalAdminAppln :"+ error);
                                        });
                                } else {
                                    //console.log("In already");
                                    for(var yy=0; yy < modAdminAppln.mappings.length; yy++) {
                                        //console.log("In already loop");
                                        if(modAdminAppln.mappings[yy].positionName != null) {
                                            mappedData.push(modAdminAppln.mappings[yy]);
                                        } else {
                                            unMappedData.push(modAdminAppln.mappings[yy]);
                                        }
                                    }
                                }
                                //console.log(mappedData.length);
                                $rootScope.MappingData = mappedData;
                                //console.log(unMappedData.length);
                                $rootScope.UnMappingData = unMappedData;
                            } else {
                                originalAdminAppln["name"] = "modified";
                                AdminApplnService
                                    .createAdminAppln(originalAdminAppln)
                                    .then(function(response1) {
                                        var modAdminAppln1 = response1.data;
                                        for(var ee=0; ee < modAdminAppln1.mappings.length; ee++) {
                                            if(modAdminAppln1.mappings[ee].positionName != null) {
                                                mappedData.push(modAdminAppln1.mappings[ee]);
                                            } else {
                                                unMappedData.push(modAdminAppln1.mappings[ee]);
                                            }
                                        }
                                        $rootScope.MappingData = mappedData;
                                        $rootScope.UnMappingData = unMappedData;
                                    }, function(error) {
                                        console.log("Cannot create modifiedAdminAppln :"+ error);
                                    });
                            }
                        }, function(error) {
                            console.log("Cannot get modifiedAdminAppln :"+ error);
                        });
                }, function(error) {
                    console.log("Cannot get originalAdminAppln :"+ error);
                });
        }

        vm.publishMappingResults = publishMappingResults;
        vm.unpublishMappingResults = unpublishMappingResults;

        function unpublishMappingResults() {
            AdminApplnService
                .findAdminApplnByName("original")
                .then(function(response) {
                    var adminApplnPublish = response.data;
                    console.log("adminAppln publish");
                    console.log(adminApplnPublish);
                    if(adminApplnPublish) {
                        //console.log("In here - update  ");
                        adminApplnPublish["isPublished"] = false;

                        AdminApplnService
                            .updateAdminApplnForPublish(adminApplnPublish._id, adminApplnPublish)
                            .then(function(response) {
                                console.log("Updated isPublished :"+ response.data);
                                vm.publishMapping = adminApplnPublish.isPublished;
                                //init();
                            }, function(error) {
                                console.log("Cannot update isPublished in originalAdminAppln :"+ error);
                            });
                    } else {
                        console.log("Cannot happen as document must be in DB.");
                    }
                }, function(error) {
                    console.log("Cannot get originalAdminAppln :"+ error);
                });
        }

        function publishMappingResults() {
            AdminApplnService
                .findAdminApplnByName("original")
                .then(function(response) {
                    var adminApplnUnPublish = response.data;
                    console.log("adminAppln unpublish");
                    console.log(adminApplnUnPublish);
                    if(adminApplnUnPublish) {
                        adminApplnUnPublish["isPublished"] = true;

                        AdminApplnService
                            .updateAdminApplnForPublish(adminApplnUnPublish._id, adminApplnUnPublish)
                            .then(function(response) {
                                console.log("Updated isPublished :"+ response.data);
                                vm.publishMapping = adminApplnUnPublish.isPublished;
                            }, function(error) {
                                console.log("Cannot update isPublished in originalAdminAppln :"+ error);
                            });
                    } else {
                        console.log("Cannot happen as document must be in DB.");
                    }
                }, function(error) {
                    console.log("Cannot get originalAdminAppln :"+ error);
                });
        }

        vm.removeStudentFromPosition = removeStudentFromPosition;

        function removeStudentFromPosition(mappingsIndex,studentIndex) {

            var student = mappedData[mappingsIndex].students.splice(studentIndex,1);
            unMappedData[0].students.push(student[0]);
            $rootScope.MappingData = mappedData;
            $rootScope.UnMappingData = unMappedData;
        }

        vm.addStudentToPosition = addStudentToPosition;

        function addStudentToPosition(courseName,studentIndex) {
            console.log(courseName);
            console.log(studentIndex);

            if(courseName === undefined) {
                return;
            }

            var unMappedStudent = unMappedData[0].students.splice(studentIndex,1);
            for(var ff=0; ff < mappedData.length; ff++) {
                if(mappedData[ff].positionName == courseName) {
                    mappedData[ff].students.push(unMappedStudent[0]);
                    break;
                }
            }
            $rootScope.MappingData = mappedData;
            $rootScope.UnMappingData = unMappedData;
        }

        vm.modifyMappingResults = modifyMappingResults;
        vm.originalMappingResults = originalMappingResults;

        function modifyMappingResults() {
            vm.showModifiedMapping = true;
        }

        function originalMappingResults() {
            vm.showModifiedMapping = false;
        }

        vm.updateModifiedMappingResults = updateModifiedMappingResults;

        function updateModifiedMappingResults() {
            var mergedMapping = mappedData.concat(unMappedData);
            AdminApplnService
                .findAdminApplnByName("modified")
                .then(function(response) {
                    var modAdminApplnToUpdate = response.data;

                    if(modAdminApplnToUpdate) {
                        modAdminApplnToUpdate["mappings"] = mergedMapping;
                        AdminApplnService
                            .updateAdminAppln(modAdminApplnToUpdate._id, modAdminApplnToUpdate)
                            .then(function(response1) {
                                console.log("Updated changes:"+ response1.data);
                            }, function(error) {
                                console.log("Cannot update modAdminApplnToUpdate :"+ error);
                            });
                    } else {
                        console.log("Not possible as record must be present");
                    }
                }, function(error) {
                    console.log("Cannot get modAdminApplnToUpdate :"+ error);
                });
        }

        vm.unpublishModifiedMappingResults = unpublishModifiedMappingResults;
        function unpublishModifiedMappingResults() {
            AdminApplnService
                .findAdminApplnByName("modified")
                .then(function(response) {
                    var modAdminApplnPublish = response.data;
                    //console.log("modAdminApplnPublish publish");
                    //console.log(modAdminApplnPublish);
                    if(modAdminApplnPublish) {
                        //console.log("In here - update  ");
                        modAdminApplnPublish["isPublished"] = false;

                        AdminApplnService
                            .updateAdminApplnForPublish(modAdminApplnPublish._id, modAdminApplnPublish)
                            .then(function(response) {
                                console.log("Updated isPublished :"+ response.data);
                                vm.modPublishMapping = modAdminApplnPublish.isPublished;
                                //init();
                            }, function(error) {
                                console.log("Cannot update isPublished in modAdminApplnPublish :"+ error);
                            });
                    } else {
                        console.log("Cannot happen as document must be in DB.");
                    }
                }, function(error) {
                    console.log("Cannot get modAdminApplnPublish :"+ error);
                });
        }

        vm.publishModifiedMappingResults = publishModifiedMappingResults;
        function publishModifiedMappingResults() {
            AdminApplnService
                .findAdminApplnByName("modified")
                .then(function(response) {
                    var modAdminApplnUnPublish = response.data;
                    //console.log("modAdminApplnUnPublish unpublish");
                    //console.log(modAdminApplnUnPublish);
                    if(modAdminApplnUnPublish) {
                        modAdminApplnUnPublish["isPublished"] = true;

                        AdminApplnService
                            .updateAdminApplnForPublish(modAdminApplnUnPublish._id, modAdminApplnUnPublish)
                            .then(function(response) {
                                console.log("Updated isPublished :"+ response.data);
                                vm.modPublishMapping = modAdminApplnUnPublish.isPublished;
                            }, function(error) {
                                console.log("Cannot update isPublished in modAdminApplnUnPublish :"+ error);
                            });
                    } else {
                        console.log("Cannot happen as document must be in DB.");
                    }
                }, function(error) {
                    console.log("Cannot get modAdminApplnUnPublish :"+ error);
                });
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