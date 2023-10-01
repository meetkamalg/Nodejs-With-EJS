const mysql = require("mysql");
const express = require("express");
const bodyparser = require("body-parser");
const { kMaxLength, kStringMaxLength } = require("buffer");
const { format } = require("path");

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public", { extensions: ["css", "js"] }));
app.use(express.static("media", { extensions: ["png", "jpg", "gif"] }));
app.use(bodyparser.urlencoded({ extended: true }));

app.listen(5500, (err) => {
  if (err) throw err;
  console.log("Server is running on port 5500.");
});

function getConnection() {
  var con = mysql.createConnection({
    host: "localhost",
    user: "meetk",
    password: "password",
    database: "travelexperts",
  });
  return con;
}

app.get("/home", (req, res) => {
  var myConnection = getConnection();
  myConnection.connect((err) => {
    if (err) throw err;

    var sql = "select * from packages";
    myConnection.query(sql, (err, result) => {
      if (err) throw err;
    
      res.render("home",{ result: result });
    });
  });
});

app.get("/contactus", (req, res) => {
  var myConnection = getConnection();
  myConnection.connect((err)=> {
  if (err) throw err;
    let sql = "SELECT * FROM agents"
    myConnection.query(sql, (err, result)=> {
      if (err) throw err;
      res.render("contactus", {result: result})
    })
  })
});

// this feature allows users to submit a form with any questions they may have to the database
app.post("/getintouch", (req, res)=>{
    var customerQuestion = [req.body.fname, req.body.lname, req.body.phone, req.body.email, req.body.message];	
    console.log(customerQuestion);
    var myConnection = getConnection();
    myConnection.connect((err)=>{
    if (err) throw err; 
    var sql = "INSERT INTO `questions`(`firstName`, `lastName`, `phone`, `email`, `message`) VALUES (?,?,?,?,?)";
    myConnection.query({ "sql": sql, "values": customerQuestion}, (err, result, fields)=>{
    if (err) throw err;
        if (result.affectedRows > 0){
            res.render("thanksforcontacting");
        } else{
            res.send("insert failed");
            }
        myConnection.end((err)=>{
        if (err) throw err;
        })
    });
    });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/customerInsert", (req, res)=>{
    var customerData = [req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress, req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry ];	
    console.log(customerData);
    var myConnection = getConnection();
    myConnection.connect((err)=>{
    if (err) throw err; 
    var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustAddress`, `CustCity`, `CustProv`, `CustPostal`, `CustCountry`) VALUES (?,?,?,?,?,?,?)";
    myConnection.query({ "sql": sql, "values": customerData }, (err, result, fields)=>{
    if (err) throw err;

    if (result.affectedRows > 0)
    {
      res.render("thanksforRegistering");
    }
    else
    {
      res.send("insert failed");
    }
    myConnection.end((err)=>{
        if (err) throw err;
    });
      });
      });
  });

app.get("/vacationpackages", (req, res) => {
  var myConnection = getConnection();
  myConnection.connect((err) => {
    if (err) throw err;

    var sql = "select * from packages";
    myConnection.query(sql, (err, result) => {
      if (err) throw err;
      res.render("vacationpackages", { result: result});
      myConnection.end((err) => {
        if (err) throw err;
        console.log("Disconnected from the Travel Experts.");
      });
    });
  });
});

app.post("/newbooking", (req, res) => {
  packageId = req.body.packageId;
  var myConnection = getConnection();
  myConnection.connect((err) => {
    if (err) throw err;
   
    res.render("bookingregister", { result: packageId });
  });
});

app.post("/packagebooking", (req, res) => {
  var customerData = [req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress, req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry];
  var myConnection = getConnection();
  myConnection.connect((err) => {
    if (err) throw err;

    var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustAddress`, `CustCity`, `CustProv`, `CustPostal`, `CustCountry`) VALUES (?,?,?,?,?,?,?)";
    myConnection.query(
      { sql: sql, values: customerData },
      (err, result, fields) => {
        if (err) throw err;
        let custID = result.insertId;       

        let packageData = [packageId, custID];
        console.log(packageData);
        var sq3 = "INSERT INTO `bookings`(`PackageId`, `CustomerId`) VALUES (?,?)";
        myConnection.query(
          {sql: sq3, values: packageData },
          (err, result, fields) => {
            if (err) throw err;
            
            res.render("thanksforBooking");
            console.log("Successful");
          }
        );
      }
    );
  });
});

app.use((req, res)=>{
	res.status(404).render('404');
});
