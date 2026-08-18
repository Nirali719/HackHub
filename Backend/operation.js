const mongoose = require("mongoose");
const dotenv = require("dotenv");

const student = require("./models/student");
const course = require("./models/course");
const enrollment = require("./models/enrollment");

dotenv.config();

const insertData = async () => {
    try {

        // Connect MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected\n");

        // ==================================================
        // STUDENT - INSERT 7 RECORDS
        // ==================================================

        console.log("========== STUDENT ==========");

        const students = await student.insertMany([
            {
                name: "Nirali",
                email: "nirali1@gmail.com",
                age: 20
            },
            {
                name: "Rahul",
                email: "rahul1@gmail.com",
                age: 21
            },
            {
                name: "Priya",
                email: "priya1@gmail.com",
                age: 19
            },
            {
                name: "Amit",
                email: "amit1@gmail.com",
                age: 22
            },
            {
                name: "Neha",
                email: "neha1@gmail.com",
                age: 20
            },
            {
                name: "Karan",
                email: "karan1@gmail.com",
                age: 23
            },
            {
                name: "Pooja",
                email: "pooja1@gmail.com",
                age: 21
            }
        ]);

        console.log("7 Student records inserted successfully.\n");


        // VERIFY STUDENT USING FIND
        const studentRecords = await student.find();

        console.log("Student records:");
        console.log(studentRecords);
        console.log(`Total Student records: ${studentRecords.length}\n`);


        // ==================================================
        // COURSE - INSERT 7 RECORDS
        // ==================================================

        console.log("========== COURSE ==========");

        const courses = await course.insertMany([
            {
                name: "Data Structures",
                code: "DS101",
                credits: 4
            },
            {
                name: "Database Management",
                code: "DBMS101",
                credits: 4
            },
            {
                name: "Operating Systems",
                code: "OS101",
                credits: 4
            },
            {
                name: "Computer Networks",
                code: "CN101",
                credits: 3
            },
            {
                name: "Web Development",
                code: "WEB101",
                credits: 3
            },
            {
                name: "Software Engineering",
                code: "SE101",
                credits: 3
            },
            {
                name: "Computer Architecture",
                code: "CA101",
                credits: 4
            }
        ]);

        console.log("7 Course records inserted successfully.\n");


        // VERIFY COURSE USING FIND
        const courseRecords = await course.find();

        console.log("Course records:");
        console.log(courseRecords);
        console.log(`Total Course records: ${courseRecords.length}\n`);


        // ==================================================
        // ENROLLMENT - INSERT 7 RECORDS
        // ==================================================

        

        // ==================================================
        // FINAL VERIFICATION
        // ==================================================

        console.log("=================================");
        console.log("FINAL VERIFICATION");
        console.log("=================================");

        console.log(
            `Students: ${studentRecords.length}/7`
        );

        console.log(
            `Courses: ${courseRecords.length}/7`
        );


        if (
            studentRecords.length === 7 &&
            courseRecords.length === 7 
        ) {
            console.log("\nAll 7 records for each schema verified successfully!");
        } else {
            console.log("\nRecord count does not match 7.");
        }


        // Disconnect
        await mongoose.disconnect();

        console.log("\nMongoDB connection closed.");

    } catch (error) {
        console.error("Error:", error.message);

        await mongoose.disconnect();
    }
};

insertData();