(function(){
    angular
        .module("TaPortal")
        .factory("AdminApplnService", AdminApplnService);


    function AdminApplnService($http) {
        var api = {
            createAdminAppln: createAdminAppln,
            deleteAdminApplnById: deleteAdminApplnById,
            findAdminApplnByName: findAdminApplnByName,
            findAllAdminAppln: findAllAdminAppln,
            updateAdminAppln: updateAdminAppln,
            updateAdminApplnForPublish: updateAdminApplnForPublish
        };

        return api;

        function updateAdminAppln(adminApplnId, adminAppln) {

            var url = "/api/adminAppln/"+adminApplnId;
            return $http.put(url, adminAppln);
        }

        function findAllAdminAppln() {
            var url = "/api/adminAppln";
            return $http.get(url);
        }

        function createAdminAppln(adminAppln) {
            var url = "/api/adminAppln";
            return $http.post(url,adminAppln);

        }

        function findAdminApplnByName(name){
            //console.log("In client side");
            var url ="/api/adminAppln?name="+name;
            return $http.get(url);

        }

        function updateAdminApplnForPublish(adminApplnId, adminAppln) {
            var url="/api/adminAppln/updatePublish/"+adminApplnId;
            return $http.put(url, adminAppln);
        }

        function deleteAdminApplnById(applnId){
            var url = "/api/adminAppln/"+applnId;
            return $http.delete(url);
        }
    }
})();