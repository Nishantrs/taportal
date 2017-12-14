/**
 * Created by anvitasurapaneni on 12/7/16.
 */

(function(){
    angular
        .module("TaPortal")
        .controller("ShowApplicationController", ShowApplicationController);

    /* HTML and Java script communicate via scope */
    /* handles the JAVA Script */

    function ShowApplicationController($routeParams, $location, UserService, $rootScope,PositionService, applicationsService,
                                       RecommendationService) {
        var vm = this;
        vm.displayProfPreference = false;
        vm.giveDecision = giveDecision;

        vm.getApplicationsByPosId = getApplicationsByPosId;
        vm.assignBasedOnProfPreference = assignBasedOnProfPreference;

        //vm.getApplications = getApplications;

        vm.orderByField = 'application';
        vm.reverseOrder = false;


        var scoringParameters = {};
        vm.userId = $rootScope.currentUser._id;
        vm.logout = logout;
        var userId = $rootScope.currentUser._id;

        $rootScope.professorPreferred = null;
        $rootScope.otherProfPreferred = null;
        var apps2 = [] ;
        var professorPreferred = [];
        var professorRejected = [];
        var otherCoursePreferred = [];
        var studentPreferred = [];
        var scoreBased = [];

        vm.showStudentsByProfPreference = showStudentsByProfPreference;
        vm.showApplications = showApplications;
        vm.posId1 = $routeParams.posId;
        /*it is good practice to declare initialization ina function. say init*/
        function init(){
            vm.posId1 = $routeParams.posId;
            console.log(vm.posId1);

            PositionService
                .findPositionById(vm.posId1)
                .then(function (response) {
                    vm.Position = response.data;

                    getApplicationsByPosId(vm.Position);
                });

            RecommendationService
                .findScoreByName('global')
                .then(
                    function (response) {
                        var scoreReceived = response.data;

                        if(scoreReceived) {
                            console.log(scoreReceived);
                            scoringParameters = scoreReceived;
                        } else {
                            scoringParameters.recommendation = 25;
                            scoringParameters.wasTA = 25;
                            scoringParameters.preference = 25;
                            scoringParameters.gpa = 25;
                            scoringParameters.grade = 0;
                            scoringParameters.availability = 0;
                            scoringParameters.availabilityRatio = 1;
                            scoringParameters.gradRatio = 1;
                        }
                    },
                    function (error) {
                        console.log("Cannot fetch the scoring parameters.")
                    }
                );


            UserService
                .findUserById(userId)
                .then(function (response) {
                    vm.user = response.data;
                    admin = response.data;
                    // console.log(faculty);
                });




        }
        init();

        function showStudentsByProfPreference() {
            vm.displayProfPreference = true;
        }

        function showApplications() {
            vm.displayProfPreference = false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        //                      Developed by Anvita                                                  //
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        function giveDecision(Appid, decision) {

            console.log(Appid);
            console.log(decision);

            applicationsService
                .GiveDecisionforApp(Appid, decision)
                .then(
                    function (response1) {
                        init();
                    });

        }

        var findUserRatingDetailsAndScore = function(application,doneCallback) {
                var sid = application._user;
                var attribute = 'score';

                UserService
                    .findUserById(sid)
                    .then(
                        function(response1) {
                            var userReceived = response1.data;
                            //console.log("User details");
                            //console.log(userReceived);
                            var userRating = userReceived.rating;
                            userRating.sort(function(a, b){return b.rating - a.rating});
                            //console.log(userRating);
                            var ratingavg = userReceived.avgRating;
                            var rateval = 2;
                            if(ratingavg > 2){
                                rateval = ratingavg;
                            }

                            var app1 = {
                                "avgRating" :     application.avgRating       ,
                                "gpa"  :          application.gpa             ,
                                "coursesTaken" :  application.coursesTaken    ,
                                "currentCourses": application.currentCourses  ,
                                "email" :         application.email           ,
                                "phone"  :        application.phone           ,
                                "resumeURL" :     application.resumeURL       ,
                                "resumeName" :    application.resumeName      ,
                                "_id":            application._id,
                                "priority":       application.priority,
                                "_position":application._position,
                                "previouslyTaken":application.previouslyTaken,
                                "gradeObtained":application.gradeObtained,
                                "beenTASemester":application.beenTASemester,
                                "availability": application.availability,
                                "_user":application._user,
                                "__v":application.__v,
                                "rating":application.rating,
                                "ratingvalue": rateval,
                                "username": userReceived.username,
                                "status": application.status
                            };

                            app1[attribute] = computeScore(application, rateval, userReceived);
                            //assignBasedOnProfPreference(application, userRating, userReceived);

                            apps2.push(app1);

                            return doneCallback(null);
                        });
        }

        function getApplicationsByPosId(position) {
            applicationsService
                .getApplicationsForPosition(position._id)
                .then(function(response){
                    console.log(response);

                    var apps1 = response.data;
                    async.each(apps1, findUserRatingDetailsAndScore, function (response) {

                        $rootScope.apps = apps2;
                        console.log("professorPreferred")
                        console.log(professorPreferred.length);
                        $rootScope.profPreferredApplns = professorPreferred;

                        console.log("professorRejected")
                        console.log(professorRejected.length);
                        $rootScope.profRejectedApplns = professorRejected;

                        console.log("otherCoursePreferred")
                        console.log(otherCoursePreferred.length);
                        $rootScope.OCPreferredApplns = otherCoursePreferred;

                        console.log("studentPreferred")
                        console.log(studentPreferred.length);
                        $rootScope.studentPreferredApplns = studentPreferred;

                        console.log("scoreBased")
                        console.log(scoreBased.length);
                        $rootScope.scoreBasedApplns = scoreBased

                        professorPreferred = [];
                        professorRejected = [];
                        otherCoursePreferred = [];
                        studentPreferred = [];
                        scoreBased = [];
                        apps2 = [];
                        console.log("Finished!");
                    });
                });
        }

        function computeScore(application,profAvgRating,user)
        {
            var gradeObtained = 0;
            var beenTABefore = 0;
            var availability = 0;
            var userRated = Math.ceil(profAvgRating);
            var gradFraction = 1;
            var maxAvailabilityRatio = scoringParameters.availabilityRatio;
            var priorityFactor = 1;

            if(application.gradeObtained == 'A') {
                gradeObtained = 4;
            } else if (application.gradeObtained == 'A-') {
                gradeObtained = 3;
            } else if (application.gradeObtained == 'B') {
                gradeObtained = 2;
            } else if (application.gradeObtained == 'B-') {
                gradeObtained = 1;
            }

            if(application.beenTASemester) {
                beenTABefore = 1;
            }

            if(application.availability == 'Fully Available') {
                availability = maxAvailabilityRatio;
            } else if (application.availability == 'Looking for Co-ops') {
                availability = maxAvailabilityRatio-1;
            }

            if(!user.isGrad) {
               gradFraction = scoringParameters.gradRatio;
            }

            if(application.priority == 1) {
                priorityFactor = 3;
            } else if (application.priority == 2) {
                priorityFactor = 2;
            } else if (application.priority == 3) {
                priorityFactor = 1;
            }

            var score = +application.gpa*(scoringParameters.gpa) +
                gradeObtained*(scoringParameters.grade) +
                beenTABefore*(scoringParameters.wasTA) +
                availability*(scoringParameters.availability) +
                userRated*(scoringParameters.recommendation) +
                priorityFactor*(scoringParameters.preference);

            var scoreFinal = Math.ceil(score/gradFraction);

            return scoreFinal;
        }


        var positions = [];
        var taughtByProf = [];
        var taughtByProfId = [];
        var profForCurrCourse = null;

        var findProfessorForCourseApplied = function(userApplication, doneCallback) {
            PositionService
                .findPositionById(userApplication._position)
                .then(
                    function (response) {
                        var positionDetail = response.data;
                        positions.push(positionDetail);

                        UserService
                            .findUserByUsername(positionDetail.username)
                            .then(
                                function (response) {
                                    var profDetail = response.data;
                                    taughtByProf.push(profDetail);
                                    taughtByProfId.push(profDetail._id);

                                    if(positionDetail._id == userApplication._position) {
                                        profForCurrCourse = profDetail._id;
                                    }

                                    return doneCallback(null);
                                }, function (error) {
                                    console.log("Cannot retrieve professor: "+ error)
                                }
                            );
                    }, function (error) {
                        console.log("Cannot retrieve position applied: "+ error)
                    }
                );
        }

        function assignBasedOnProfPreference(application, userRating, user)
        {
            // [done]if user rating is undefined or prof rating is irrelevant, go with score
            // [done]if professor rating is higher than any other, then go with the professor
            // [done]if professor rating is intermediate then assign to highest applicable professor
            // [done]if professor ratings are same, go with student preference

            //console.log("In here");

            var positionsApplied = [];
            var ratingIrrelevant = true;

            applicationsService
                .findApplicationForUser(application._user)
                .then(
                    function (response){
                        positionsApplied = response.data;

                        async.each(positionsApplied, findProfessorForCourseApplied, function (response) {
                            console.log("Finished Professor Details!");

                            for(var qq = 0 ; qq < userRating.length; qq++) {
                                for(var j = 0 ; j < taughtByProf.length; j++) {
                                    if(userRating[qq]._user == taughtByProf[j]._id) {
                                        ratingIrrelevant = false;
                                        break;
                                    }
                                }
                            }

                            // Case where the student has not been rated by any professor or current course professor, hence decision to be made based on score
                            if(userRating == undefined || userRating == null || ratingIrrelevant) {
                                var maxScore = computeScore(positionsApplied[0],2,user)
                                var selectedApplication = positionsApplied[0];

                                for(var rr = 1; rr < positionsApplied.length; rr++) {
                                    var intermediateScore = computeScore(positionsApplied[rr],2,user);
                                    if(maxScore < intermediateScore) {
                                        maxScore = intermediateScore;
                                        selectedApplication = positionsApplied[rr];
                                    }
                                }

                                if(selectedApplication._id == application._id) {
                                    professorPreferred.push(application);
                                } else {
                                    var position = null;
                                    for(var zz = 0; zz < positions.length; zz++) {
                                        if(selectedApplication._position == positions[zz]._id) {
                                            console.log("In here");
                                            position = positions[zz];
                                        }
                                    }
                                    if (position != null) {
                                        var otherAssignment = {
                                            "gpa": application.gpa,
                                            "email": application.email,
                                            "resumeURL": application.resumeURL,
                                            "resumeName": application.resumeName,
                                            "priority": application.priority,
                                            "priorityOther": selectedApplication.priority,
                                            "previouslyTaken": application.previouslyTaken,
                                            "gradeObtained": application.gradeObtained,
                                            "beenTASemester": application.beenTASemester,
                                            "otherCourse": position.course,
                                            "otherProfessor": position.professor,
                                            "score": application.score,
                                            "otherScore": maxScore
                                        };
                                        scoreBased.push(otherAssignment);
                                    }
                                }
                                positions = [];
                                taughtByProf = [];
                                taughtByProfId = [];
                                profForCurrCourse = null;
                                return;
                            } else {
                                // if professor rating is higher than any other, then go with the professor
                                // if professor rating is intermediate then assign to highest applicable professor

                                var currentProfRating = 2;

                                for(var o = 0; o < userRating.length; o++) {
                                    if(profForCurrCourse == userRating[o]._user) {
                                        currentProfRating = userRating[o].rating;
                                    }
                                }

                                for(var i = 0; i < userRating.length; i++) {
                                    // make sure valid professor is considered
                                    if(taughtByProfId.indexOf(userRating[i]._user) != -1) {
                                        var count = 0;
                                        for(var m = 0; m < taughtByProf.length; m++) {
                                            if(taughtByProf[m]._id == userRating[i]._user) {
                                                count = count + 1;
                                            }
                                        }
                                        if(count == 1) {
                                            if((userRating[i]._user == profForCurrCourse) &&
                                                ((i+1 < userRating.length) && ((userRating[i].rating > userRating[i+1].rating) &&
                                                (taughtByProfId.indexOf(userRating[i+1]._user) != -1)))) {
                                                professorPreferred.push(application);
                                                positions = [];
                                                taughtByProf = [];
                                                taughtByProfId = [];
                                                profForCurrCourse = null;
                                                return;
                                            } else if(userRating[i]._user != profForCurrCourse &&
                                                (i+1 < userRating.length && (userRating[i].rating > userRating[i+1].rating &&
                                                (taughtByProfId.indexOf(userRating[i+1]._user) != -1)))) {
                                                var profForOtherCourse = null;
                                                var otherPosition = null;
                                                var otherApplication = null;
                                                var otherProfRating = userRating[i].rating;

                                                // finding details of other professor
                                                for(var j = 0; j < taughtByProf.length; j++) {
                                                    if(taughtByProf[j]._id == userRating[i]._user) {
                                                        profForOtherCourse = taughtByProf[j];
                                                        break;
                                                    }
                                                }

                                                for(var k = 0; k < positions.length; k++) {
                                                    if(profForOtherCourse.username == positions[k].username) {
                                                        otherPosition = positions[k];
                                                        break;
                                                    }
                                                }

                                                for(var n = 0; n < positionsApplied.length; n++) {
                                                    if(positionsApplied[n]._position == otherPosition._id) {
                                                        otherApplication = positionsApplied[n];
                                                        break;
                                                    }
                                                }

                                                var otherCourse = {
                                                    "gpa"  :          application.gpa             ,
                                                    "email" :         application.email           ,
                                                    "resumeURL" :     application.resumeURL       ,
                                                    "resumeName" :    application.resumeName      ,
                                                    "priority":       application.priority,
                                                    "priorityOther":       otherApplication.priority,
                                                    "previouslyTaken":application.previouslyTaken,
                                                    "gradeObtained":application.gradeObtained,
                                                    "beenTASemester":application.beenTASemester,
                                                    "otherCourse": otherPosition.course,
                                                    "otherProfessor": otherPosition.professor,
                                                    "profRating": currentProfRating,
                                                    "otherProfRating": otherProfRating
                                                };

                                                otherCoursePreferred.push(otherCourse);
                                                if(currentProfRating == 1) {
                                                    professorRejected.push(application);
                                                }
                                                positions = [];
                                                taughtByProf = [];
                                                taughtByProfId = [];
                                                profForCurrCourse = null;
                                                return;
                                            } else {
                                                // if professor ratings are same, go with student preference
                                                // Need to make it more than 2
                                                var highestPriority = 100;
                                                var selectedHighPriorityAppln = null;
                                                var positionHighPriority = null;

                                                for(var ii = 0; ii < taughtByProf.length; ii++) {
                                                    if(taughtByProf[ii]._id == userRating[i]._user || taughtByProf[ii]._id == userRating[i+1]._user) {
                                                        if(positionsApplied[ii].priority < highestPriority) {
                                                            highestPriority = positionsApplied[ii].priority;
                                                            selectedHighPriorityAppln = positionsApplied[ii];
                                                            positionHighPriority = positions[ii];
                                                        }
                                                    }
                                                }

                                                var finalCourseByStudentPreference = {
                                                    "gpa"  :          application.gpa             ,
                                                    "email" :         application.email           ,
                                                    "resumeURL" :     application.resumeURL       ,
                                                    "resumeName" :    application.resumeName      ,
                                                    "priority":       application.priority,
                                                    "priorityOther":       selectedHighPriorityAppln.priority,
                                                    "previouslyTaken":application.previouslyTaken,
                                                    "gradeObtained":application.gradeObtained,
                                                    "beenTASemester":application.beenTASemester,
                                                    "otherCourse": positionHighPriority.course,
                                                    "otherProfessor": positionHighPriority.professor,
                                                    "profRating": currentProfRating,
                                                    "otherProfRating": userRating[i].rating
                                                };
                                                if (positionHighPriority._id == application._position) {
                                                    professorPreferred.push(finalCourseByStudentPreference);
                                                } else {
                                                    studentPreferred.push(finalCourseByStudentPreference);
                                                }
                                                positions = [];
                                                taughtByProf = [];
                                                taughtByProfId = [];
                                                profForCurrCourse = null;
                                                return;
                                            }
                                        } else {
                                            // What if applied to different position by same prof
                                            // Should go with student preference
                                            // applied to different positions with same professor
                                            // multiple positions and same professor
                                            var highPriority = 100;
                                            var finalApplication = null;
                                            var finalPosition = null;

                                            for(var p = 0; p < taughtByProf.length; p ++) {
                                                if(userRating[i]._user == taughtByProf[p]._id) {
                                                    if(positionsApplied[p].priority < highPriority) {
                                                        highPriority = positionsApplied[p].priority;
                                                        finalApplication = positionsApplied[p];
                                                        finalPosition = positions[p];
                                                    }
                                                }
                                            }

                                            if(userRating[i]._user == profForCurrCourse) {
                                                if(finalApplication._id == application._id) {
                                                    professorPreferred.push(application);
                                                } else {
                                                    var finalCourseBySameProfessor = {
                                                        "gpa"  :          application.gpa             ,
                                                        "email" :         application.email           ,
                                                        "resumeURL" :     application.resumeURL       ,
                                                        "resumeName" :    application.resumeName      ,
                                                        "priority":       application.priority,
                                                        "priorityOther":       finalApplication.priority,
                                                        "previouslyTaken":application.previouslyTaken,
                                                        "gradeObtained":application.gradeObtained,
                                                        "beenTASemester":application.beenTASemester,
                                                        "otherCourse": finalPosition.course,
                                                        "otherProfessor": finalPosition.professor,
                                                        "profRating": currentProfRating,
                                                        "otherProfRating": currentProfRating
                                                    };

                                                    otherCoursePreferred.push(finalCourseBySameProfessor)
                                                }
                                                positions = [];
                                                taughtByProf = [];
                                                taughtByProfId = [];
                                                profForCurrCourse = null;
                                                return;
                                            } else {
                                                var finalCourseBySameProfessorDiff = {
                                                    "gpa"  :          application.gpa             ,
                                                    "email" :         application.email           ,
                                                    "resumeURL" :     application.resumeURL       ,
                                                    "resumeName" :    application.resumeName      ,
                                                    "priority":       application.priority,
                                                    "priorityOther":       finalApplication.priority,
                                                    "previouslyTaken":application.previouslyTaken,
                                                    "gradeObtained":application.gradeObtained,
                                                    "beenTASemester":application.beenTASemester,
                                                    "otherCourse": finalPosition.course,
                                                    "otherProfessor": finalPosition.professor,
                                                    "profRating": currentProfRating,
                                                    "otherProfRating": userRating[i].rating
                                                };

                                                otherCoursePreferred.push(finalCourseBySameProfessorDiff);
                                                positions = [];
                                                taughtByProf = [];
                                                taughtByProfId = [];
                                                profForCurrCourse = null;
                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }, function (error){
                        console.log("Cannot retrieve application for users: "+ error)
                    });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////
        //                      Developed by Srivatsav                                                      //
        ////////////////////////////////////////////////////////////////////////////////////////////////////


        // Author: Sesha Sai Srivatsav

        function findAllPositions() {
            PositionService
                .findAllPositions()
                .then(function (response) {
                    var pos = response.data;

                    for(i=0; i<pos.length; i++){
                        var temp = pos[i].deadline;
                        pos[i].deadline = new Date(temp);
                    }
                    vm.positions = pos;
                    possss = pos[-1];
                    //console.log(  vm.positions);
                    vm.positionCount = vm.positions.length;

                });
        }


        // Author: Sesha Sai Srivatsav
        function logout() {
            UserService
                .logout()
                .then(
                    function (response) {
                        $location.url("/login");
                    },
                    function () {
                        $location.url("/login");
                    }
                );
        }


    }


})();
