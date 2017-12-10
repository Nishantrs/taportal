///ManageCoursesSemestersController

(function () {
    angular
        .module("TaPortal")
        .controller("ManageCreatePositionsController",ManageCreatePositionsController);

    function ManageCreatePositionsController($rootScope, $location, $sce, PositionService, UserService,CoursesandSemestersService,
                                             applicationsService) {
        var vm = this;
        //var userId = $rootScope.currentUser._id;

        vm.fileContent = null;

        vm.createPosition = createPosition;
        vm.updatePosition  = updatePosition;
        vm.deletePosition = deletePosition;
        vm.updateDeadline = updateDeadline;
        vm.createPositions = createPositions;
        vm.logout = logout;
        
        vm.orderByField = 'course';
        vm.reverseOrder = false;

        function init() {
            vm.fileContent = null;
            findAllPositions();
            getLoggedInUser();
            findAllCourses();
            findAllSemesters();

            //if(userId){
            //    $location.url("/createandmanageapplications");
            //}
        }
        init();


        ////////////////////////////////////////////////////////////////////////////////////////////////////
        //                      Developed by Srivatsav                                                      //
        ////////////////////////////////////////////////////////////////////////////////////////////////////


        // Author: Sesha Sai Srivatsav

        function updateDeadline(semestername, deadline) {
            var position = {
                semester : semestername,
                deadline : deadline
            };
            PositionService
                .updateDeadline(position)
                .then(
                    function (response) {
                        vm.updatedmessage = "Updated Successfully!";
                    }
                );
        }


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

        function createPosition(coursename, semestername, number, professor, username, deadline) {
            //console.log("from create " + deadline);
            var position = {
                course : coursename,
                semester : semestername,
                number : number,
                professor : professor,
                username : username,
                deadline :deadline
            };

            PositionService
                .createPosition(position)
                .then(
                    function (response) {
                        vm.createsuccess = "Created TA Position Successfully";

                        // PositionService
                        //     .findAllPositions()
                        //     .then(
                        //         function (response) {
                        //             vm.positions = response.data;
                        //             vm.positionCount = vm.positions.length;
                        //         }
                        //  );
                        init();
                    }
                )
        }


        // Author: Sesha Sai Srivatsav

        function updatePosition(positionId, position) {
            PositionService
                .updatePosition(positionId, position)
                .then(
                    function (response) {
                        vm.updatedmessage = "Updated Successfully!";
                        // PositionService
                        //     .findAllPositions()
                        //     .then(
                        //         function (response) {
                        //             vm.positions = response.data;
                        //             vm.positionCount = vm.positions.length;
                        //         }
                        //     );
                        init();
                    }
                );
        }

        // Author: Sesha Sai Srivatsav

        var deleteApplnBeforePosDelete = function(application,doneCallback) {
            console.log("appln +1");
            applicationsService
                .deleteApplication(application._id)
                .then(function(response) {
                    return doneCallback(null);
                },function(error) {
                    console.log("Cannot find application to delete: "+ error);
                });
        }

        function deletePosition(positionId) {

            applicationsService
                .getApplicationsForPosition(positionId)
                .then(function (response) {
                    if(response) {
                        var positionApplications = response.data;
                        // Now get students from application and sort them based on rating and
                        // individual preference of students
                        console.log("positionApplications for deletion");
                        console.log(positionApplications.length);
                        async.each(positionApplications, deleteApplnBeforePosDelete, function (response) {

                            console.log("Finished applications deletion!!!!");
                            PositionService
                                .deletePosition(positionId)
                                .then(
                                    function (response) {
                                        vm.warning = "Deleted Successfully!";
                                        vm.createsuccess = null;
                                        init();
                                    }
                                )
                        });
                    } else {
                        console.log("No application found for position");
                    }
                }, function (error) {
                    console.log("Cannot find applications for position: "+ error);
                });
        }

        // Author: Sesha Sai Srivatsav

        function findAllCourses() {
            CoursesandSemestersService
                .findAllCourses()
                .then(function (response) {
                    vm.courses =  response.data;
                    vm.courseCount = vm.courses.length;
                })
        }


        // Author: Sesha Sai Srivatsav

        function findAllSemesters() {
            CoursesandSemestersService
                .findAllSemesters()
                .then(function (response) {
                    vm.semesters =  response.data;
                    vm.semesterCount = vm.semesters.length;
                })
        }

        // Author: Sesha Sai Srivatsav

        function getLoggedInUser() {
            if($rootScope.currentUser){
                vm.loggedIn = "true";
                loggedInUserId = $rootScope.currentUser._id;

            } else {
                vm.notloggedIn = "true";

            }
        }

        function createPositions(positionArr) {
            console.log("In here");
            for (i = 0; i < positionArr.length; i++)
            {
                var positionTuple = positionArr[i];

                if (positionTuple["course"] == "")
                {
                    continue;
                }

                var position = {
                    course : positionTuple["course"],
                    semester : positionTuple["semester"],
                    number : +positionTuple["number"],
                    professor : positionTuple["professor"],
                    username : positionTuple["username"],
                    deadline : new Date(positionTuple["deadline"])
                };

                // Validations can be done for the positions for repeated entry
                PositionService
                    .createPosition(position)
                    .then(
                        function (response) {
                            //vm.createsuccess = "Created TA Position Successfully";
                            // Handle errors here
                            console.log("Created TA Position Successfully " + i)
                        }
                    )
            }
            init();
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