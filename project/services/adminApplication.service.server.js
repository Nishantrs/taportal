// Author : Nishant Shetty
module.exports= function(app, models){

    var adminApplicationModel = models.adminApplicationModel;

    app.post("/api/adminAppln", createAdminAppln);
    app.get("/api/adminAppln", getAdminApplns);
    app.delete("/api/adminAppln/:adminApplnId", deleteAdminApplnById);
    app.delete("/api/adminAppln", deleteAdminApplnByName);

    app.put("/api/adminAppln/:adminApplnId", updateAdminAppln);
    app.put("/api/adminAppln/updatePublish/:adminApplnId", updateAdminApplnForPublish);

    function updateAdminAppln(req, res) {
        console.log("In updateAdminAppln method");
        var adminAppln = req.body;
        var name = adminAppln.name;
        var mappings  = adminAppln.mappings;
        //console.log(name);
        //console.log(mappings);
        adminApplicationModel
            .updateAdminAppln(name, mappings)
            .then(
                function (stats) {
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                }
            );
    }

    function updateAdminApplnForPublish(req, res) {
        //console.log("In updateAdminApplnForPublish method");
        var adminAppln = req.body;
        var name = adminAppln.name;
        var isPublished = adminAppln.isPublished;
        //console.log(score);
        adminApplicationModel
            .updateAdminApplnForPublish(name, isPublished)
            .then(
                function (stats) {
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                }
            );
    }

    function createAdminAppln(req, res) {
        //console.log("In create adminApplication method");
        var adminApplicationName = req.body.name;

        adminApplicationModel
            .findAdminApplnByName(adminApplicationName)
            .then(
                function (score) {
                    if(score){
                        res.send("adminApplication name already in use");
                        return;
                    } else {
                        console.log("Before creating adminAppln");
                        return adminApplicationModel
                            .createAdminAppln(req.body)
                    }
                },
                function (err) {
                    res.sendStatus(400).send(err);
                });
    }

    function getAdminApplns(req, res) {
        var adminApplicationName = req.query.name;
        console.log("In here - routing");
        if(adminApplicationName){
            findAdminApplnByName(adminApplicationName, res);
        } else {
            findAllAdminAppln(req, res);
        }
    }

    function deleteAdminApplnById(req,res) {
        //console.log("In deleteAdminApplnById method");
        var adminApplnId = req.params.adminApplnId;
        adminApplicationModel
            .deleteAdminApplnById(adminApplnId)
            .then(function (stats) {
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                });
    }

    function deleteAdminApplnByName(req,res) {
        //console.log("In deleteScoreByName method");
        var name = req.query.name;
        adminApplicationModel
            .deleteAdminApplnByName(name)
            .then(function (stats) {
                    //responds with some stats
                    res.sendStatus(200);
                },
                function (error) {
                    res.statusCode(404).send(error);
                });
    }

    function findAdminApplnByName(name, res) {
        console.log("In findAdminApplnByName method");
        console.log(name);
        adminApplicationModel
            .findAdminApplnByName(name)
            .then(
                function (score) {
                    //console.log("return the adminAppln from the find method");
                    res.json(score);
                },
                function (error) {
                    res.sendStatus(404).send(error);
                }
            );
    }

    function findAllAdminAppln(req, res) {
        console.log("In findAdminApplnByName method");
        adminApplicationModel
            .findAllAdminAppln()
            .then(
                function (adminApplns) {
                    res.json(adminApplns);
                },
                function (error) {
                    res.statusCode(404).send(error);
                }
            );
    }
};