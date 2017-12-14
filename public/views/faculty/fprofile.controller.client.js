/**
 * Created by seshasai on 11/5/2016.
 */
(function(){
    angular
        .module("TaPortal")
        .controller("FProfileController", FProfileController);

    /* HTML and Java script communicate via scope */
    /* handles the JAVA Script */

    function FProfileController($routeParams, $location, UserService, $rootScope,PositionService, applicationsService,
                                AdminApplnService) {
        var vm = this;

        vm.assignment = {};

        vm.rateStudent = rateStudent;
      //  vm.findAverage = findAverage;
        var faculty;
        vm.avg1;
        vm.apps;
        vm.getApplications = getApplications;
        vm.applications;
        vm.avg = 0;
        vm.updateUser = updateUser;
        vm.deleteUser = deleteUser;
        vm.userId = $rootScope.currentUser._id;
        vm.logout = logout;
        var userId = $rootScope.currentUser._id;
        /*it is good practice to declare initialization ina function. say init*/
        function init(){
            UserService
                .findUserById(userId)
                .then(function (response) {
                    vm.user = response.data;
                    faculty = response.data;
                    getAssignedStudents();
                });
            findAllPositions();

        }
        init();


          ////////////////////////////////////////////////////////////////////////////////////////////////////
        //                      Developed by Anvita                                                  //
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        function rateStudent(StudentID, rating) {


            UserService
                .findUserById1(StudentID)
                .then(
                    function (response) {

             



                       var  rating1 = response.data.rating;


                        var ratingFull =   {
                            _user : faculty._id, //in model
                            //ratedBy: String,
                            rating: rating
                        };

                        rating1.push(ratingFull);





                      var ii = {
                          array12: rating1
                      }



                        UserService
                            .rateStudent(StudentID, ii);
                            //.then(
                            //    function (response1) {
                            //
                            //        //$rootScope.apps = response.data;
                            //        //init();
                            //
                            //        console.log("Response.data  for student updtate asd");
                            //        console.log(response1.data);
                            //        //console.log(vm.applications);
                            //
                            //    });

                    });




        }


        //function findAverage(StudentID) {
        //    UserService
        //        .findUserById1("58476899f2228854246e14bd")
        //        .then(
        //            function (response) {
        //
        //                console.log(response.data);
        //                var   ratingavg = response.data.avgRating;
        //                console.log(ratingavg);
        //
        //                $rootScope.avg1 = ratingavg;
        //                $rootScope.a12 = 12;
        //
        //
        //                return ratingavg;
        //
        //
        //
        //
        //
        //            });
        //}


        function getApplications(position) {

            var ratingGiven = 1;

            applicationsService
                .getApplicationsForPosition(position._id)
                .then(
                    function (response) {

                    var apps1 = response.data;
                        var apps2 = [] ;

                        for (i = 0; i < apps1.length; i++) {
                            var sid = apps1[i]._user;



                            UserService
                                .findUserById1(sid)
                                .then(
                                    function (response) {


                                       var   ratingavg = response.data.avgRating;
                                        console.log(ratingavg);

                                            $rootScope.avg1 = ratingavg;





                                        //console.log($rootScope.avg1);



                                    });
                           //console.log( vm.findAverage(sid));
                           // console.log($rootScope.avg1);
                            //console.log($rootScope.a12);
                            var rateval = 1;
                            if($rootScope.avg1 > 1){
                                rateval = $rootScope.avg1;
                            }
                            var app1 = {

                                "_id":apps1[i]._id,"priority":apps1[i].priority,"_position":apps1[i]._position,
                                "previouslyTaken":apps1[i].previouslyTaken,"gradeObtained":apps1[i].gradeObtained,
                                "beenTASemester":apps1[i].beenTASemester,"availability": apps1[i].availability,
                                "_user":apps1[i]._user,"__v":apps1[i].__v,"rating":apps1[i].rating, "ratingvalue": rateval

                            };

                            apps2.push(app1);

                            //  console.log(ratingGiven);

                        }


                        console.log(apps2);



                        $rootScope.apps = apps2;
                        init();

                        //console.log("Response.data");
                        //console.log(vm.applications);


                       $location.url("/applicationsForCource");
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

        function getAssignedStudents() {

            var studentMappings = [];

            AdminApplnService
                .findAdminApplnByName("modified")
                .then(function(response) {
                    var modAdminApplnPublish = response.data;
                    if(modAdminApplnPublish) {
                        console.log("modAdminApplnPublish publish");
                        console.log(modAdminApplnPublish);
                        if(modAdminApplnPublish["isPublished"]) {
                            for(var zz = 0; zz < modAdminApplnPublish["mappings"].length; zz++) {
                                if(faculty.username == modAdminApplnPublish["mappings"][zz].profUsername) {
                                    var posStudentMapping = {};
                                    posStudentMapping["course"] = modAdminApplnPublish["mappings"][zz].positionName;
                                    posStudentMapping["number"] = modAdminApplnPublish["mappings"][zz].number;
                                    posStudentMapping["students"] = modAdminApplnPublish["mappings"][zz].students;
                                    studentMappings.push(posStudentMapping);
                                }
                            }
                            $rootScope.mappings = studentMappings;
                            return;
                        } else {
                            AdminApplnService
                                .findAdminApplnByName("original")
                                .then(function(response) {
                                    var adminApplnPublish = response.data;
                                    console.log("adminAppln publish");
                                    console.log(adminApplnPublish);
                                    if(adminApplnPublish) {
                                        if(adminApplnPublish["isPublished"]) {
                                            for(var zz = 0; zz < adminApplnPublish["mappings"].length; zz++) {
                                                if(faculty.username == adminApplnPublish["mappings"][zz].profUsername) {
                                                    var posStudentMapping = {};
                                                    posStudentMapping["course"] = adminApplnPublish["mappings"][zz].positionName;
                                                    posStudentMapping["number"] = adminApplnPublish["mappings"][zz].number;
                                                    posStudentMapping["students"] = adminApplnPublish["mappings"][zz].students;
                                                    studentMappings.push(posStudentMapping);
                                                }
                                            }
                                            $rootScope.mappings = studentMappings;
                                            return;
                                        } else {
                                            $rootScope.mappings = false;
                                            return;
                                        }
                                    } else {
                                        console.log("Cannot happen as document must be in DB.");
                                    }
                                }, function(error) {
                                    console.log("Cannot get originalAdminAppln :"+ error);
                                });
                        }
                    } else {
                        console.log("Cannot happen as document must be in DB.");
                    }
                });
        }



    }


})();
