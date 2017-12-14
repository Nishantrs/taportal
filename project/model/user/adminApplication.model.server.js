module.exports = function () {

    var mongoose = require ("mongoose");
    var AdminApplicationSchema = require("./adminApplication.schema.server")();
    var AdminApplication =  mongoose.model("AdminApplication", AdminApplicationSchema);

    var api = {

        createAdminAppln: createAdminAppln,
        updateAdminAppln: updateAdminAppln,
        updateAdminApplnForPublish: updateAdminApplnForPublish,
        findAdminApplnByName: findAdminApplnByName,
        findAllAdminAppln: findAllAdminAppln,
        deleteAdminAppln: deleteAdminAppln,
        deleteAdminApplnByName: deleteAdminApplnByName
    };
    return api;

    function findAllAdminAppln() {
        console.log("findAllAdminAppln");
        return AdminApplication.find();
    }

    function findAdminApplnByName(name) {
        console.log("findAdminApplnByName");
        return AdminApplication.findOne({name: name});
    }

    function updateAdminAppln(name, studentsFull) {
        return AdminApplication
            .update({name: name},{
                "$set": { "mappings": studentsFull
                }}
            );
    }

    function updateAdminApplnForPublish(name, publish) {
        return AdminApplication
            .update({name: name},{
                "$set": { "isPublished": publish
                }}
            );
    }

    function deleteAdminApplnByName(name) {
        return AdminApplication.remove({name: name});
    }

    function deleteAdminAppln(adminAppId) {
        return AdminApplication.remove({_id: adminAppId});
    }

    function createAdminAppln(adminAppln) {
        console.log("createAdminAppln");
        return  AdminApplication.create(adminAppln);
    }
};
