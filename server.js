// app dependencies 
const express = require('express');
require('dotenv').config();
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

//app setup:
const PORT = process.env.PORT || 3000;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.use(express.static('./public'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
// app.use(express.json());
app.use(methodOverride('_method'));



// routes
app.post('/signIn',signInHandler);
app.post('/signUp',signUpHandler);


// handler functions
function signInHandler(req,res){
    /* 1 get:  email, pass
       2 query to check the email & pass
       3 if exists => redirect to home..
       4 if Not => alert ( email or password is wrong)
    */
    const {email,pass}=req.body;
    let SQL = `SELECT * FROM users WHERE email=$1 AND password =$2`;
    let values=[email,pass];
    client.query(SQL,values).then((data)=>{
        
        if(data.rows.length){
            res.render('index',{user:data.rows[0]}) 

        }
        else{
            res.json('email or password is wrong')
        }
        // front end check the type of response.. ( string (error) OR object )

    }
    )

}

function signUpHandler(req,res){
/*     1 get: user data ( id ,fName, lName, email, password)
       2 query to insert the user
       3 redirect to singIn
*/
    const {firstName,lastName,email,pass}=req.body;
    let SQL = `INSERT INTO users (firstName,lastName,email,password) VALUES ($1,$2,$3,$4) RETURNING *;`;
    let values=[firstName,lastName,email,pass];
    client.query(SQL,values).then(data=>{
        res.render('index',{user:data.rows[0]})
         
    })
    .catch(e=>{errorHandler(`Email is already exists..${e}`,req,res)})
    // front end check the type of response.. ( string (error) OR object )



}

function errorHandler(error,req,res){
    res.status(500).json(error)
}

function anyRouteHandler(req,res){
    res.render('error');
}


// constructors 





// all routes & error 
app.use(errorHandler);
app.get('*',anyRouteHandler)

// connection 
client.connect().then(()=>{
    app.listen(PORT,()=>{console.log(`Listening on ${PORT}`)})

})