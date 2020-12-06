'use strict';

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
app.get('/',homePageHandler);





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
function homePageHandler(req,res){
let urlFood=`https://www.themealdb.com/api/json/v1/1/random.php`;
let cocktailUrl=`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail`;
let dessertUrl=`https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert`;

superagent.get(urlFood).then(foodResult=>{
    superagent.get(cocktailUrl).then(cocktailResult=>{
        superagent.get(dessertUrl).then(dessertResult=>{
            res.render('register',{cocktail:cocktailResult,food:foodResult,dessert:dessertResult})
        })
    })
})

// res.render('index');


}
function errorHandler(req,res){
    res.status(500)
    res.json('errorHandler');
    
}

function anyRouteHandler(req,res){
    res.render('error');
}




// constructors 

function Food(foodObj){
this.food_id=foodObj.idMeal;
this.name=foodObj.strMeal;
this.ingredients=getFoodIngredients(foodObj);
this.steps=foodObj.strInstructions? foodObj.strInstructions: 'There is no instructions';
this.img_url=foodObj.strMealThumb? foodObj.strMealThumb: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1055&q=80';
this.area=foodObj.strArea? foodObj.strArea:'No Area';
this.category=foodObj.strCategory?foodObj.strCategory:'No Category';
this.vid_url=foodObj.strYoutube? foodObj.strYoutube:'https://youtu.be/wkg_AyHE82w';
this.type='food';
}

function Drinks(drinkObj){
    this.drink_id=drinkObj.idDrink;
    this.name=drinkObj.strDrink;
    this.ingredients=getDrinkIngredients(drinkObj);
    this.steps=drinkObj.strInstructions? drinkObj.strInstructions: 'There is no instructions';
    this.img_url=drinkObj.strDrinkThumb? drinkObj.strDrinkThumb:'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80';
    this.category=drinkObj.strCategory?drinkObj.strCategory:'No Category';
    this.vid_url=drinkObj.strVideo?drinkObj.strVideo :'https://youtu.be/FSpxlvcw9d4';
    this.type='drink';
}




//helper functions
function getFoodIngredients(){

}

function getDrinkIngredients(){

}


// all routes & error 
app.use(errorHandler);
app.get('*',anyRouteHandler)

// connection 
client.connect().then(()=>{
    app.listen(PORT,()=>{console.log(`Listening on ${PORT}`)})

})

