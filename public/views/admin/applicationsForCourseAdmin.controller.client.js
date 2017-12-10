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
        var professorPreferred = [];
        var professorRejected = [];
        var otherCoursePreferred = [];
        var studentPreferred = [];
        var scoreBased = [];

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


        function getApplicationsByPosId(position) {
            applicationsService
                .getApplicationsForPosition(position._id)
                .then(function(response){
                    console.log(response);

                        var apps1 = response.data;

                        var apps2 = [] ;
                        var j = -1;
                        //var ratingGiven = 1;
                        for(var i =0; i<apps1.length; i++){

                            var sid = apps1[i]._user;

                            //console.log("User Id");
                            //console.log(sid);
                            var attribute = 'score';

                            UserService
                                .findUserById(sid)
                                .then(
                                function(response1){
                                    j++;
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
                                        "avgRating" :     apps1[j].avgRating       ,
                                        "gpa"  :          apps1[j].gpa             ,
                                        "coursesTaken" :  apps1[j].coursesTaken    ,
                                        "currentCourses": apps1[j].currentCourses  ,
                                        "email" :         apps1[j].email           ,
                                        "phone"  :        apps1[j].phone           ,
                                        "resumeURL" :     apps1[j].resumeURL       ,
                                        "resumeName" :    apps1[j].resumeName      ,
                                        "_id":            apps1[j]._id,
                                        "priority":       apps1[j].priority,
                                        "_position":apps1[j]._position,
                                        "previouslyTaken":apps1[j].previouslyTaken,
                                        "gradeObtained":apps1[j].gradeObtained,
                                        "beenTASemester":apps1[j].beenTASemester,
                                        "availability": apps1[j].availability,
                                        "_user":apps1[j]._user,
                                        "__v":apps1[j].__v,
                                        "rating":apps1[j].rating,
                                        "ratingvalue": rateval,
                                        "username": userReceived.username,
                                        "status": apps1[j].status
                                    };

                                    app1[attribute] = computeScore(apps1[j], rateval, userReceived);
                                    //assignBasedOnProfPreference(apps1[j], userRating, userReceived)

                                    apps2.push(app1);
                                });

                        }
                    $rootScope.apps = apps2;
                    }

                );

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

        function assignBasedOnProfPreference(application, userRating, user)
        {
            // [done]if user rating is undefined or prof rating is irrelevant, go with score
            // [done]if professor rating is higher than any other, then go with the professor
            // [done]if professor rating is intermediate then assign to highest applicable professor
            // if professor ratings are same, go with student preference

            var positionsApplied = [];
            var positions = [];
            var taughtByProf = [];
            var taughtByProfId = [];
            var ratingIrrelevant = true;
            var profForCurrCourse = null;

            applicationsService
                .findApplicationForUser(application._user)
                .then(
                    function (response){
                        positionsApplied = response.data;
                    }, function (error){
                        console.log("Cannot retrieve application for users: "+ error)
                    });

            for(var i = 0; i < positionsApplied.length; i++) {
                PositionService
                    .findPositionById(positionsApplied[i]._position)
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

                                        if(positionDetail._id == application._position) {
                                            profForCurrCourse = profDetail._id;
                                        }
                                    }, function (error) {
                                        console.log("Cannot retrieve professor: "+ error)
                                    }
                                );
                        }, function (error) {
                            console.log("Cannot retrieve position applied: "+ error)
                        }
                    );
            }

            for(var qq = 0 ; qq < userRating.length; qq++) {
                for(var j = 0 ; j < taughtByProf.length; j++) {
                    if(userRating[qq]._user == taughtByProf[j]._id) {
                        ratingIrrelevant = false;
                        break;
                    }
                }
            }

            if(userRating === undefined || userRating === null || ratingIrrelevant) {
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
                    //var temp = { application(student email, gpa, link,...., your score), other score, other course name, other professor }
                    // Not required
                    PositionService
                        .findPositionById(selectedApplication._position)
                        .then(
                            function (response){
                                position = response.data;
                                var otherAssignment = {
                                    "gpa"  :          application.gpa             ,
                                    "email" :         application.email           ,
                                    "resumeURL" :     application.resumeURL       ,
                                    "resumeName" :    application.resumeName      ,
                                    "priority":       application.priority,
                                    "priorityOther":       selectedApplication.priority,
                                    "previouslyTaken":application.previouslyTaken,
                                    "gradeObtained":application.gradeObtained,
                                    "beenTASemester":application.beenTASemester,
                                    "otherCourse": position.course,
                                    "otherProfessor": position.professor,
                                    "score": application.score,
                                    "otherScore": maxScore
                                };

                                scoreBased.push(otherAssignment);

                            }, function (error){
                                console.log("Cannot retrieve application for users: "+ error)
                            });
                }
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
                        if(userRating[i]._user == profForCurrCourse && (i+1 < userRating.length && userRating[i].rating > userRating[i+1].rating && (taughtByProfId.indexOf(userRating[i+1]._user) != -1))) {
                            professorPreferred.push(application);
                            return;
                        } else if(userRating[i]._user != profForCurrCourse && (i+1 < userRating.length && userRating[i].rating > userRating[i+1].rating && (taughtByProfId.indexOf(userRating[i+1]._user) != -1))) {
                            var profForOtherCourse = null;
                            var otherPosition = null;
                            var otherApplication = null;
                            var otherProfRating = userRating[i].rating;

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
                            return;
                        } else {
                            // if professor ratings are same, go with student preference
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

                            studentPreferred.push(finalCourseByStudentPreference);


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
                            }
                        }
                    }
                }
            }
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
