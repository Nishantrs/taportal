// Author : Nishant Shetty
module.exports= function(app, models){

    var scoreModel = models.scoreModel;

    app.post("/api/score", createScore);
    app.get("/api/score/:scoreId", findScoreById);
    app.get("/api/score", findScoreByName);
    app.delete("/api/score/:scoreId", deleteScoreById);
    app.delete("/api/score", deleteScoreByName);
    app.put("/api/score/:scoreId", updateScoreById);
    app.put("/api/score", updateScoreByName);

    //function getUsers(req, res) {
    //    var username = req.query.username;
    //    var password = req.query.password;
    //    if(username && password){
    //        findUserByCredentials(username, password, req, res);
    //    } else if(username){
    //        findUserByUsername(username, res);
    //    }else {
    //        findallusers();
    //    }
    //}

    // Description:  Updates metadata of given user when userId is specified
    // function: updateUser
    function updateScoreById(req, res) {
        //console.log("In updateScoreById method");
        var id = req.params.scoreId;
        var score = req.body;
        scoreModel
            .updateScoreById(id, score)
            .then(
                function (stats) {
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                }
            );
    }

    function updateScoreByName(req, res) {
        //console.log("In updateScoreByName method");
        var scoreName = req.query.scorename;
        var score = req.body;
        //console.log(score);
        scoreModel
            .updateScoreByName(scoreName, score)
            .then(
                function (stats) {
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                }
            );
    }

    // Description: Creates a user
    // function: createUser
    function createScore(req, res) {
        //console.log("In create score method");
        var scoreName = req.body.name;

        scoreModel
            .findScoreByName(scoreName)
            .then(
                function (score) {
                    if(score){
                        res.send("Score name already in use");
                        return;
                    } else {
                        console.log("Before creating score");
                        return scoreModel
                            .createScore(req.body)
                    }
                },
                function (err) {
                    res.sendStatus(400).send(err);
                });
    }

    // Description: Deletes completed course of a student/faculty
    // function:deleteUserCourse
    function deleteScoreById(req,res) {
        //console.log("In deleteScoreById method");
        var scoreId = req.params.scoreId;
        scoreModel
            .deleteScoreById(scoreId)
            .then(function (stats) {

                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                });
    }

    // Description:  Deletes the current course of a student
    // function: deleteCurrentCourse
    function deleteScoreByName(req,res) {
        //console.log("In deleteScoreByName method");
        var scoreName = req.query.scorename;
        scoreModel
            .deleteScoreByName(scoreName)
            .then(function (stats) {
                    //responds with some stats
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                });
    }

    //// Description: Deletes the user from the system.
    //// function: deleteUser
    //function deleteUser(req,res) {
    //    var userId = req.params.userId;
    //
    //    scoreModel
    //        .deleteUser(userId)
    //        .then(function (stats) {
    //                res.sendStatus(200);
    //            },
    //            function (error) {
    //                res.statusCode(404).send(error);
    //            });
    //
    //
    //}

    // Description: Given a userId, this returns the user Object
    // function: findUserById
    function findScoreById(req, res){
        //console.log("In findScoreById method");
        var id = req.params.scoreId;

        scoreModel
            .findScoreById(id)
            .then(function (score) {
                    res.send(score);
                },
                function (error) {
                    res.statusCode(404).send(error);
                });

    }

    // Description: Given username, this function returns the user object
    // function: findUserByUsername
    function findScoreByName(req, res) {
        //console.log("In findScoreByName method");
        var scoreName = req.query.scorename;
        //console.log(scoreName);
        scoreModel
            .findScoreByName(scoreName)
            .then(
                function (score) {
                    //console.log("return the score from the find method");
                    res.json(score);
                },
                function (error) {
                    res.sendStatus(404).send(error);
                }
            );
    }
};