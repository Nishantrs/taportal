/**
 * Authored by Seshasai on 11/3/2016.
 */
//we create a schema

module.exports = function () {
    // MongoDB has no notion of schemas. this is at the application level
    var mongoose = require("mongoose");

    var UserSchema = mongoose.Schema ({

        //Common fields for all the users
        username: String, // Username
        password: String, //Password
        firstName: String, //First Name
        lastName: String, // LastName
        email: String, // Email of the student
        usertype: {type : String,  enum: ['student', 'faculty', 'admin']}, // type: student, faculty, admin
        image: String, // Image of the user
        aboutMyself: String, // Few lines about the user
        isGrad: {type: Boolean, default: false}, // Might be required for scoring based on education level


        resumeURL: String,
        resumeName: String,

        nuid : Number,
        phone : String,
        gpa : String,

        // coursesTaken: [
        //     {
        //         name: String
        //     }
        // ],
        // currentCourses :[
        //     {
        //         name: String
        //     }
        // ],

        
        coursesTaken: [String],
        currentCourses :[String],

        rating :[
            {
                _user : {type : mongoose.Schema.ObjectId, ref: "User"}, //in model
                ratedBy: String,
                rating: Number
            }
        ],

        avgRating: Number,

        feedBack : [
            {
                _user : {type : mongoose.Schema.ObjectId, ref: "User"}, //in model
                givenBy: String,
                feedback: String
            }
        ],

        //Fields related to the Faculty
        myCourses:[
            {
                courseName: String //Consists of Course ID + Course Name

            }
        ]

    }, {collection: 'taportal.user'});
    return UserSchema;
};
