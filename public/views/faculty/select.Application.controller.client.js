/**
 * Created by anvitasurapaneni on 12/7/16.
 */

(function(){
    angular
        .module("TaPortal")
        .controller("selectedApplicationController", selectedApplicationController);

    /* HTML and Java script communicate via scope */
    /* handles the JAVA Script */

    function selectedApplicationController($routeParams, $location, UserService, $rootScope,PositionService, applicationsService) {
        var vm = this;
        var apps2 = [] ;


        // Author: Srivatsav | for sorting
        vm.orderByField = 'application';
        vm.reverseOrder = false;

        vm.rateStudent = rateStudent;
        //  vm.findAverage = findAverage;
        var faculty;
        vm.possss;
        vm.avg1;
        vm.apps;
        vm.getApplications = getApplications;


        vm.userId = $rootScope.currentUser._id;
        vm.logout = logout;
        var userId = $rootScope.currentUser._id;

        vm.posId1 = $routeParams.posId;
        /*it is good practice to declare initialization ina function. say init*/
        function init(){
            //console.log(vm.posId1);
            UserService
                .findUserById(userId)
                .then(function (response) {
                    vm.user = response.data;
                    faculty = response.data;
                   // console.log(faculty);
                });

            PositionService
                .findPositionById(vm.posId1)
                .then(function (response) {
                    vm.Position = response.data;
                    
                    getApplications(vm.Position);
                });



        }
        init();



        ////////////////////////////////////////////////////////////////////////////////////////////////////
        //                      Developed by Anvita                                                  //
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        function rateStudent(StudentID, rating) {

            UserService
                .findUserById(StudentID)
                .then(
                    function (response) {

                    var  rating1 = response.data.rating;
                        var ratingAll = [];
                        var ratingNew =   {
                            _user : faculty._id, //in model
                            //ratedBy: String,
                            rating: rating
                        };


                        for (var i = 0; i < rating1.length; i++) {
                           if(rating1[i]._user != ratingNew._user){
                               ratingAll.push(rating1[i]);
                           }

                        }
                        ratingAll.push(ratingNew);

                        var ii = {
                            array12: ratingAll
                        };

                    UserService
                            .rateStudent(StudentID, ii)
                            .then(
                                function (response1) {

                                 init();
                                });

                    });




        }



        var findUserRatingDetails = function(application, doneCallBack) {
            var sid = application._user;
            UserService
                .findUserById(sid).then(
                function(response1){
                    var student = response1.data;
                    var ratingavg = student.avgRating;

                    var rateval = 2;
                    if(ratingavg > 2){
                        rateval = ratingavg;
                    }

                    var profRating = 2;
                    for(var k = 0; k < student.rating.length; k++) {
                        if(student.rating[k]._user == faculty._id) {
                            profRating = student.rating[k].rating;
                        }
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
                        "_id":application._id,"priority":application.priority,"_position":application._position,
                        "previouslyTaken":application.previouslyTaken,"gradeObtained":application.gradeObtained,
                        "beenTASemester":application.beenTASemester,"availability": application.availability,
                        "_user":application._user,"__v":application.__v,
                        "rating":application.rating,
                        "ratingvalue": rateval, username: student.username,
                        "profRating" : profRating
                    };

                    apps2.push(app1);
                    return doneCallBack(null);
                });
        }


        function getApplications(position) {

            applicationsService
                .getApplicationsForPosition(position._id)
                .then(function(response){
                        var apps1 = response.data;

                    async.each(apps1, findUserRatingDetails, function (response) {
                        $rootScope.apps = apps2;
                        apps2 = [];
                        console.log("Finished!");

                    });
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

                    for(var i=0; i<pos.length; i++){
                        var temp = pos[i].deadline;
                        pos[i].deadline = new Date(temp);
                    }


                    vm.positions = pos;
                    //var possss = pos[-1];
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
        // Author: Sesha Sai Srivatsav
        function deleteUser() {
            UserService
                .deleteUser(userId)
                .then(function (response) {
                    var result= response.data;
                    if(result){
                        $location.url("/login");
                    }else{
                        vm.error = "can't delete you."
                    }
                });
        }

        // Author: Sesha Sai Srivatsav
        function updateUser(user){
            UserService
                .updateUser(userId, user)
                .then(function (res) {
                    var updatedUser = res.data;
                    if (updatedUser){
                        vm.success="successfully updated!";
                    }else{
                        vm.error = "Some thing doesn't seem right here";
                    }
                });
        }



    }


})();
