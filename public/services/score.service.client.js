// Author : Nishant Shetty
(function(){
    angular
        .module("TaPortal")
        .factory("RecommendationService", RecommendationService);




    function RecommendationService($http) {
        /* provide an API that allows access to recommendation score */
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
        /*functions are implemented below*/

        function createScore(score) {
            console.log("In Recommendation Services Client....createScore");
            var url = "/api/score";
            return $http.post(url,score);
        }

        //// checks whether the user is loggedin
        //function loggedIn() {
        //    return $http.get("/api/loggedIn");
        //}
        //
        //// Author : Sesha Sai Srivatsav
        //// logs out a user
        //function logout() {
        //    return $http.post("/api/logout" );
        //}

        // returns score object for given scoreId
        function findScoreById(scoreId) {
            var url = "/api/score/" + scoreId;
            return $http.get(url);
        }

        // returns score object for given score name
        function findScoreByName(scoreName){
            var url ="/api/score?scorename="+scoreName;
            return $http.get(url);

        }

        // deletes score object for given score id
        function deleteScoreById(scoreId){
            var url = "/api/score/"+scoreId;
            return $http.delete(url);
        }

        // deletes score object for given score name
        function deleteScoreByName(scoreName){
            var url = "/api/score?scorename="+scoreName;
            return $http.delete(url);
        }

        // returns updated score object for given score id
        function updateScoreById(scoreId, score){
            var url="/api/score/"+scoreId;
            return $http.put(url, score);
        }

        // returns updated score object for given score name
        function updateScoreByName(score){
            var url="/api/score?scorename="+score.name;
            return $http.put(url, score);
        }
    }
})();