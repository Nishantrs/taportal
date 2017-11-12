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

        //vm.getApplications = getApplications;

        vm.orderByField = 'application';
        vm.reverseOrder = false;


        var scoringParameters = {};
        vm.userId = $rootScope.currentUser._id;
        vm.logout = logout;
        var userId = $rootScope.currentUser._id;

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
                                    var ratingavg = userReceived.avgRating;
                                    var rateval = 1;
                                    if(ratingavg > 1){
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
                                        "status": apps1[j].status,
                                    };

                                    app1[attribute] = computeScore(apps1[j],rateval,userReceived);

                                    apps2.push(app1);
                                    $rootScope.apps = apps2;
                                });

                        }
                    }

                );

        }

        function computeScore(application,profRating,user)
        {
            var gradeObtained = 0;
            var beenTABefore = 0;
            var availability = 0;
            var userRated = Math.ceil(profRating);
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
