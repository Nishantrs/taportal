// entry gate in to the database connection
// Node JS module
module.exports  = function () {

    var models = {
        userModel : require("./user/user.model.server")(),
        courseModel : require ("./user/course.model.server")(),
        semesterModel : require ("./user/semester.model.server")(),
        positionModel: require ("./user/position.model.server")(),
        applicationModel: require("./user/application.model.server")(),
        scoreModel: require("./user/score.model.server")(),
        adminApplicationModel: require("./user/adminApplication.model.server")()
    };
    return models;
};