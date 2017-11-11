// Author : Nishant Shetty
module.exports = function () {
    var mongoose = require("mongoose");

    var ScoreSchema = mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        recommendation: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        wasTA: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        preference: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        gpa: {
            type: Number,
            min: 0,
            max: 100,
            default : 0,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        // Fields that might be needed based on Dean's discretion
        grade: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
            required: false,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        availability: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
            required: false,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        availabilityRatio: {
            type: Number,
            min: 1, // Available full-time, 100%
            max: 2, // On coop, available part-time, 50%
            default: 1,
            required: false,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        gradRatio: {
            type: Number,
            min: 1, // equal preference to grad and undergrad
            max: 4, // 4:1 preference ratio for grads
            default: 1,
            required: false,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        }
        //,
        //early: {
        //    type: Number,
        //    min: 0,
        //    max: 100,
        //    default: 0,
        //    required: false,
        //    validate: {
        //        validator: Number.isInteger,
        //        message: '{VALUE} is not an integer value'
        //    }
        //}
    }, {collection: 'taportal.score'});
    return ScoreSchema;
};
