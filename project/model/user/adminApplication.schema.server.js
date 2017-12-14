module.exports = function () {
    var mongoose = require("mongoose");

    var AdminApplicationSchema = mongoose.Schema({
        name : {
            type: String,
            required: true,
            unique: true
        },
        isPublished : Boolean,
        mappings : [
            {
                _position: {type: mongoose.Schema.ObjectId, ref: "Position"},
                positionName: String,
                profUsername: String,
                professor: String,
                number: Number,
                students: [
                    {
                        _user: {type: mongoose.Schema.ObjectId, ref: "User"},
                        firstName: String,
                        lastName: String,
                        email: String
                    }
                ],
                isTracked: Boolean
            }
        ]
    }, {collection: 'taportal.adminApplication'});
    return AdminApplicationSchema;
};
