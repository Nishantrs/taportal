// Author : Nishant Shetty
"use strict";

(function () {

    angular
        .module("TaPortal")
        .controller("SetScoreController",SetScoreController);

    function SetScoreController($location, RecommendationService, UserService, $rootScope) {

        const WEIGHTAGE  = "global";

        // view model
        var vm = this;
        vm.showCreate = true;
        var userId = $rootScope.currentUser._id;
        vm.isFirst = false;
        vm.updateScore={};
        vm.displayScore = {};
        vm.ssmessage = null;
        vm.userdetailsedit = false;

        vm.save = save;
        vm.scoreUpdate = scoreUpdate;
        vm.scoreEdit = scoreEdit;
        vm.scoreEditCancel= scoreEditCancel;
        vm.logout = logout;


        function init()
        {
            //console.log(userId);
            if(userId)
            {
                RecommendationService
                    .findScoreByName(WEIGHTAGE)
                    .then(function(response)
                    {
                        var scoreStored = response.data;
                        console.log(scoreStored);

                        if(scoreStored)
                        {
                            vm.displayScore = scoreStored;
                        } else {
                            vm.isFirst = true;
                            vm.displayScore.name=WEIGHTAGE;
                            vm.displayScore.recommendation=25;
                            vm.displayScore.wasTA=25;
                            vm.displayScore.preference=25;
                            vm.displayScore.gpa=25;
                            vm.displayScore.grade=0;
                            vm.displayScore.availability=0;
                            vm.displayScore.availabilityRatio=1;
                            vm.displayScore.gradRatio=1;
                        }
                    },function (err) {
                        console.log("In error");
                        console.log(err);
                });
            } else {
                alert("Your are not loggedIn");
                $location.path("/login");
            }
        }

        function scoreEdit()
        {
            //console.log("In score edit");
            vm.userdetailsedit = true;
            vm.updateScore.recommendation = vm.displayScore.recommendation;
            vm.updateScore.wasTA = vm.displayScore.wasTA;
            vm.updateScore.preference = vm.displayScore.preference;
            vm.updateScore.gpa = vm.displayScore.gpa;
            vm.updateScore.grade = vm.displayScore.grade;
            vm.updateScore.availability = vm.displayScore.availability;
            vm.updateScore.availabilityRatio = vm.displayScore.availabilityRatio;
            vm.updateScore.gradRatio = vm.displayScore.gradRatio;
        }

        function scoreEditCancel()
        {
            vm.userdetailsedit = false;
        }

        init();

        function save(score)
        {
            score.name = WEIGHTAGE;

            validateInput(score)

            if(userId)
            {
                RecommendationService
                    .createScore(score)
                    .then(function(response)
                    {
                        var scoreStored = response.data;
                        if(scoreStored)
                        {
                            vm.isFirst = false;
                            $location.path("/setscore")
                        }
                    },function (err)
                    {
                        console.log(err);
                    });
            } else {
                alert("Your are not loggedIn");
                $location.path("/login");
            }
        }

        function scoreUpdate(score)
        {
            console.log("In update score");
            score.name = WEIGHTAGE;


            if (validateInput(score))
            {
                if(userId)
                {
                    console.log("validation successful");
                    RecommendationService
                        .updateScoreByName(score)
                        .then(function(response)
                        {
                            //var scoreStored = response.data;
                            console.log(response);
                            if(response)
                            {
                                vm.userdetailsedit = false;
                                vm.ssmessage="";
                                init();
                                //vm.displayScore = scoreStored;
                            }
                        },function (err)
                        {
                            console.log(err);
                        });
                } else {
                    alert("Your are not loggedIn");
                    $location.path("/login");
                }
            }
        }

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

        function validateInput(score)
        {
            if(!score.name)
            {
                vm.ssmessage = "Please provide name for scoring";
                return false;
            }

            if(+score.recommendation  < 0 || score.recommendation == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for professor recommendation";
                return false;
            }

            if(+score.wasTA < 0 || score.wasTA == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for already been TA";
                return false;
            }

            if(+score.preference < 0 || score.preference == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for student preference";
                return false;
            }

            if(+score.gpa < 0 || score.gpa == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for student gpa";
                return false;
            }

            if(+score.grade < 0 || score.grade == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for student grade in course";
                return false;
            }

            if(+score.availability  < 0 || score.availability == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for student availability during semester";
                return false;
            }

            if(+score.availabilityRatio < 0 || score.availabilityRatio == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for availabilityRatio during semester";
                return false;
            }

            if(+score.gradRatio < 0 || score.gradRatio == null)
            {
                vm.ssmessage = "Please provide appropriate weightage for grad to undergrad ratio during semester";
                return false;
            }

            // (parseInt(score.recommendation) + parseInt(score.wasTA) + parseInt(score.grade) + parseInt(score.gpa) + parseInt(score.availability)
            // + parseInt(score.preference)
            if((+score.recommendation + +score.wasTA + +score.grade + +score.gpa + +score.availability
            + +score.preference > 100) || (+score.recommendation + +score.wasTA + +score.grade + +score.gpa + +score.availability
                + +score.preference < 100))
            {
                console.log(+score.recommendation + +score.wasTA + +score.grade + +score.gpa + +score.availability
                    + +score.preference);
                console.log("count error");
                vm.ssmessage = "Sum of weightage should be equal to 100";
                return false;
            }

            if(+score.availabilityRatio > 2)
            {
                vm.ssmessage = "Max availability ratio is 2";
                return false;
            }

            if(+score.gradRatio > 4)
            {
                vm.ssmessage = "Max grad ratio is 4";
                return false;
            }
            return true;
        }
    }
})();
