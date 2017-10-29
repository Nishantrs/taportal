module.exports = function () {

    var mongoose = require("mongoose");
    var ScoreSchema = require("./score.schema.server")();
    var Score = mongoose.model("Score", ScoreSchema);

    var api = {

        createScore: createScore,
        findScoreById: findScoreById,
        findScoreByName: findScoreByName,
        deleteScoreById: deleteScoreById,
        deleteScoreByName: deleteScoreByName,
        updateScoreById: updateScoreById,
        updateScoreByName: updateScoreByName
    };
    return api;


    function findScoreById(scoreId) {u
        return Score.findById({_id: scoreId});
    }

    function findScoreByName(scoreName) {
        return Score.findOne({name: scoreName});
    }

    function deleteScoreById(scoreId) {
        return Score.remove({_id: scoreId});
    }

    function deleteScoreByName(scoreName) {
        return Score.remove({name: scoreName});
    }

    function createScore(score) {
        return  Score.create(score);
    }

    function updateScoreById(scoreId, score) {
        delete score._id;
        return Score
            .update({_id: scoreId},{
                $set: {name: score.username,
                    recommendation : score.recommendation,
                    wasTA : score.wasTA,
                    preference: score.preference,
                    gpa : score.gpa,
                    grade: score.grade,
                    availability: score.availability,
                    availabilityRatio: score.availabilityRatio,
                    gradRatio: score.gradRatio,
                    early: score.early
                }}
            );
    }

    function updateScoreByName(scoreName, score) {
        delete score._id;
        return Score
            .update({name: scoreName},{
                $set: {name: score.username,
                    recommendation : score.recommendation,
                    wasTA : score.wasTA,
                    preference: score.preference,
                    gpa : score.gpa,
                    grade: score.grade,
                    availability: score.availability,
                    availabilityRatio: score.availabilityRatio,
                    gradRatio: score.gradRatio,
                    early: score.early
                }}
            );
    }
}
