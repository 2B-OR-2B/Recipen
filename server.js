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
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(methodOverride('_method'));



// routes
app.post('/signIn', signInHandler);
app.post('/signUp', signUpHandler);
app.get('/', homePageHandler);
app.post('/details', datailsHandler);

//temporary rout
app.get('/testResult', (req, res) => {
    res.render('result', {
        data: '', suggestions: [
            {
                id: '111',
                name: 'Mandi',
                ingredients: 'aaaaaaaa,aaaaaa,aaaaaa,aaaaaa',
                steps: 'Mix the cornflour and 1 tbsp soy sauce, toss in the prawns and set aside for 10 mins. Stir the vinegar, remaining soy sauce, tomato purée, sugar and 2 tbsp water together to make a sauce.\r\n\r\nWhen you’re ready to cook, heat a large frying pan or wok until very hot, then add 1 tbsp oil. Fry the prawns until they are golden in places and have opened out– then tip them out of the pan.\r\n\r\nHeat the remaining oil and add the peanuts, chillies and water chestnuts. Stir-fry for 2 mins or until the peanuts start to colour, then add the ginger and garlic and fry for 1 more min. Tip in the prawns and sauce and simmer for 2 mins until thickened slightly. Serve with rice',
                img_url: 'data:image/jpeg;base64,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',
                vid_url: '',
                area: 'Arab',
                category: 'meal',
                type: 'food'

            }]
    })
})

// handler functions

function signInHandler(req, res) {
    /* 1 get:  email, pass
       2 query to check the email & pass
       3 if exists => redirect to home..
       4 if Not => alert ( email or password is wrong)
    */
    const { email, pass } = req.body;
    let SQL = `SELECT * FROM users WHERE email=$1 AND password =$2`;
    let values = [email, pass];
    client.query(SQL, values).then((data) => {

        if (data.rows.length) {
            res.render('index', { user: data.rows[0] })

        }
        else {
            res.json('email or password is wrong')
        }
        // front end check the type of response.. ( string (error) OR object )

    })

}

function signUpHandler(req, res) {
    /*     1 get: user data ( id ,fName, lName, email, password)
           2 query to insert the user
           3 redirect to singIn
    */
    const { firstName, lastName, email, pass } = req.body;
    let SQL = `INSERT INTO users (firstName,lastName,email,password) VALUES ($1,$2,$3,$4) RETURNING *;`;
    let values = [firstName, lastName, email, pass];
    client.query(SQL, values).then(data => {
        res.render('index', { user: data.rows[0] })

    })
        .catch(e => { errorHandler(`Email is already exists..${e}`, req, res) })
    // front end check the type of response.. ( string (error) OR object )



}

function datailsHandler(req, res) {
    console.log(req.body);
    res.render('detailsResults', { obj: req.body })
}

function homePageHandler(req, res) {
    let urlFood = `https://www.themealdb.com/api/json/v1/1/random.php`;
    let cocktailUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail`;
    let dessertUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert`;

    superagent.get(urlFood).then(foodResult => {
        superagent.get(cocktailUrl).then(cocktailResult => {
            superagent.get(dessertUrl).then(dessertResult => {
                res.render('register', { cocktail: cocktailResult, food: foodResult, dessert: dessertResult })
            })
        })
    })

    // res.render('index');


}


function errorHandler(error, req, res) {
    res.status(500).json(error)
}

function anyRouteHandler(req, res) {
    res.render('error');
}

// constructors 

function Food(foodObj) {
    this.food_id = foodObj.idMeal;
    this.name = foodObj.strMeal;
    this.ingredients = getFoodIngredients(foodObj);
    this.steps = foodObj.strInstructions ? foodObj.strInstructions : 'There is no instructions';
    this.img_url = foodObj.strMealThumb ? foodObj.strMealThumb : 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1055&q=80';
    this.area = foodObj.strArea ? foodObj.strArea : 'No Area';
    this.category = foodObj.strCategory ? foodObj.strCategory : 'No Category';
    this.vid_url = foodObj.strYoutube ? foodObj.strYoutube : 'https://youtu.be/wkg_AyHE82w';
    this.type = 'food';
}


function Drinks(drinkObj) {
    this.drink_id = drinkObj.idDrink;
    this.name = drinkObj.strDrink;
    this.ingredients = getDrinkIngredients(drinkObj);
    this.steps = drinkObj.strInstructions ? drinkObj.strInstructions : 'There is no instructions';
    this.img_url = drinkObj.strDrinkThumb ? drinkObj.strDrinkThumb : 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80';
    this.category = drinkObj.strCategory ? drinkObj.strCategory : 'No Category';
    this.vid_url = drinkObj.strVideo ? drinkObj.strVideo : 'https://youtu.be/FSpxlvcw9d4';
    this.type = 'drink';
}




//helper functions
function getFoodIngredients() {

}

function getDrinkIngredients() {

}


// all routes & error 
// app.use(errorHandler);
app.get('*', anyRouteHandler)

// connection 
client.connect().then(() => {
    app.listen(PORT, () => { console.log(`Listening on ${PORT}`) })

})

