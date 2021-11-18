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
const client = new pg.Client(process.env.DATABASE_URL,{ssl: true});
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));



// routes
app.post('/signIn', signInHandler);
app.post('/signUp', signUpHandler);
app.get('/', homePageHandler);
app.get('/searchPage', searchPageHandler)
app.post('/searchFood', searchFoodHandler);
app.post('/searchDrink', searchDrinkHandler);
app.post('/details', detailsHandler);
app.post('/saveFood', saveFoodHandler);
app.post('/saveDrink', saveDrinkHandler);
app.get('/register',registerHandler)
app.get('/fav',favPageHandler);
app.delete('/deleteFav',deleteFavHandler);
app.get('/about',(req,res)=>{res.render('about')});
//temporary rout



// handler functions
function deleteFavHandler (req,res){
    let user_id = req.query.id;
    let {type,id}=req.body;
    let SQL='';
    
    if(type==='food'){
     SQL= 'DELETE FROM fav_foods WHERE user_id = $1 AND food_id=$2';
    }
    else{
        SQL= 'DELETE FROM fav_drinks WHERE user_id = $1 AND drink_id=$2';
    }
    let values=[user_id,id];
    client.query(SQL,values).then(()=>{
        res.redirect(`/fav?id=${user_id}`)
    })
    .catch(e=>{errorHandler('error within deleting from favorites = = ='+e)})


}

function registerHandler (req,res){
    res.render('register',{isLoggedIn:true,isRegistered:true,id:''})
}

function favPageHandler(req,res){
    let id = req.query.id;
    let SQL = 'SELECT  a.*, b.* FROM foods AS a JOIN fav_foods AS b ON a.id = b.food_id WHERE b.user_id =$1;';
    let values=[id];
    client.query(SQL,values).then(response1=>{
        let SQL = 'SELECT  a.*, b.* FROM drinks AS a JOIN fav_drinks AS b ON a.id = b.drink_id WHERE b.user_id =$1;';
        let values=[id];
        client.query(SQL,values).then(response2=>{
            res.render('fav',{foods: response1.rows,drinks:response2.rows,id:id});
        }).catch(e=>{errorHandler('error within joining the tables fav_drink and drinks = = ='+e)})
    }).catch(e=>{errorHandler('error within joining the tables fav_food and foods = = ='+e)})

}



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
            // res.render('index', { user: data.rows[0] })
            res.redirect(`/?id=${data.rows[0].id}`);

        }
        else {
            res.render('register',{isLoggedIn:false , isRegistered:true,id:''})
        }
        // front end check the type of response.. ( string (error) OR object )

    }).catch(e=>{errorHandler('error while checking the email and password = = ='+e)})

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
        // res.render('index', { user: data.rows[0] })
        res.redirect(`/?id=${data.rows[0].id}`)

    }).catch(e => { res.render('register',{isLoggedIn:true , isRegistered:false,id:''}) })
    // front end check the type of response.. ( string (error) OR object )



}

function detailsHandler(req, res) {
    let id = req.query.id;
    res.render('detailsResults', { obj: req.body ,id:id})
}

function homePageHandler(req, res) {
    let id = req.query.id || -1;
    let SQL = 'SELECT * FROM users WHERE id = $1';
    let values =[id];
    
    client.query(SQL,values).then(data=>{
        let urlFood = `https://www.themealdb.com/api/json/v1/1/random.php`;
        let cocktailUrl = `https://www.thecocktaildb.com/api/json/v1/1/random.php`;
        let dessertUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert`;
    
        superagent.get(urlFood).then(foodResult => {
            superagent.get(cocktailUrl).then(cocktailResult => {
                superagent.get(dessertUrl).then(dessertResult => {
                    res.render('index', { cocktail: cocktailResult.body, food: foodResult.body, dessert: dessertResult.body, user:data.rows[0]})
                }).catch(e=>{errorHandler('error within getting data using dessertURL from the API = = ='+e)})
            }).catch(e=>{errorHandler('error within getting data using cocktailURL from the API = = ='+e)})
        }).catch(e=>{errorHandler('error within getting data using urlFood from the API = = ='+e)})
    }).catch(e=>{errorHandler('error within getting user data  = = ='+e)})

}

function saveFoodHandler(req, res) {
    let id = Number(req.body.id);
    let { name, ingredients, steps, img_url, vid_url, category, area } = req.body;
    let userID =Number( req.query.id);
    console.log(id,"-----",userID);
    let SQL = 'INSERT INTO foods VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING';
    let values = [id, name, ingredients, steps, img_url, vid_url, category, area];
    client.query(SQL, values).then(() => {
        let SQL2 ='INSERT INTO fav_foods VALUES ($1,$2)';
        let Values2 = [userID,id];
        client.query(SQL2,Values2).then(()=>{
            res.status(200).json('done')
           
        }
        ).catch(error=>{res.status(600).json(" ------ Already exists in your favorites")})
        
    }).catch(e=>{errorHandler('error within insert food to foods table  = = ='+e)})
   
}
function saveDrinkHandler(req, res) {
    // let { id, name, ingredients, steps, img_url, vid_url, category } = req.body;
    // let SQL = 'INSERT INTO drinks VALUES ($1,$2,$3,$4,$5,$6,$7)';
    // let values = [id, name, ingredients, steps, img_url, vid_url, category];
    // res.json('hello drink')

    let id = Number(req.body.id); // drink id
    let { name, ingredients, steps, img_url, vid_url, category, area } = req.body;
    let userID =Number( req.query.id);
    console.log(id,"-----",userID);
    let SQL = 'INSERT INTO drinks VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING';
    let values = [id, name, ingredients, steps, img_url, vid_url, category];
    client.query(SQL, values).then(() => {
        let SQL2 ='INSERT INTO fav_drinks VALUES ($1,$2)';
        let Values2 = [userID,id];
        client.query(SQL2,Values2).then(()=>{
            res.status(200).json('done')
           
        }
        ).catch(error=>{res.status(600).json(" ------ Already exists in your favorites")})
        
    }).catch(e=>{errorHandler('error within insert drink to drinks table  = = ='+eval)})
   

}


function errorHandler(req, res,error) {
    res.status(500).json(error)
}

function anyRouteHandler(req, res) {
    res.render('error');
}

// constructors 

function Food(foodObj) {
    this.id = foodObj.idMeal;
    this.name = foodObj.strMeal;
    this.ingredients = getFoodIngredients(foodObj);
    this.steps = foodObj.strInstructions ? foodObj.strInstructions : 'There is no instructions';
    this.img_url = foodObj.strMealThumb ? foodObj.strMealThumb : 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1055&q=80';
    this.area = foodObj.strArea ? foodObj.strArea : 'No Area';
    this.category = foodObj.strCategory ? foodObj.strCategory : 'No Category';
    this.vid_url = foodObj.strYoutube ? foodObj.strYoutube : '';
    this.type = 'food';
}


function Drinks(drinkObj) {
    this.id = drinkObj.idDrink;
    this.name = drinkObj.strDrink;
    this.ingredients = getDrinkIngredients(drinkObj);
    this.steps = drinkObj.strInstructions ? drinkObj.strInstructions : 'There is no instructions';
    this.img_url = drinkObj.strDrinkThumb ? drinkObj.strDrinkThumb : 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80';
    this.category = drinkObj.strCategory ? drinkObj.strCategory : 'No Category';
    this.vid_url = drinkObj.strVideo ? drinkObj.strVideo : '';
    this.type = 'drink';
}


function searchPageHandler(req, res) {
    let id = req.query.id;
    res.render('search',{id:id});
}


function searchFoodHandler(req, res) {
    let id = req.query.id; // send it within the render method to the result page...
    // req.body()=> data from form
    let firstIngredient = req.body.firstIngredient;
    let secondIngredient = req.body.secondIngredient;
    let thirdIngredient = req.body.thirdIngredient;
    let url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${firstIngredient}`;
    let searchByIdURL = ``;
    let gArr = [];
    let counter = 0;
    let resultObjects = []; //objects has the ingredient.
    superagent.get(url)
        .then(result => result.body.meals.map(element => element.idMeal))
        .then(result2 => result2.map((ele, idx) => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${Number(result2[idx])}`))//get the links for each meal
        .then(urls => {
            let suggestions = [];
            let arr = urls.map((e, idxx) => { // will loop fo number of meals with 
                superagent.get(e)
                    .then(result4 => { // result4 is a meal we get it using ID 
                        let x = result4.body.meals[0]; // object inside the value of meals(array)
                        if(  getFoodIngredients(x).includes(secondIngredient) && getFoodIngredients(x).includes(thirdIngredient)  ){

                            gArr.push(x);
                        }

                        counter++;
                        suggestions.push(result4.body.meals[0]);
                        if (counter == urls.length - 1) {
                            resultObjects = gArr;
                            return [resultObjects, suggestions]; //return datafrom the second and third , from the first ingrefient;
                        }
                        else {
                            return false;
                        }

                    })
                    .then((result9, idx) => { //two arrayys one for the data and one for hte suggestions
                        if (result9) {
                            let dataArray = result9[0].map(element => new Food(element))
                            dataArray = dataArray.length? dataArray: '';
                            let suggestionsArray = result9[1].map(element => new Food(element))
                            suggestionsArray=suggestionsArray.length? suggestionsArray : '';
                            res.render('result',{data:dataArray,suggestions:suggestionsArray,id:id});
                        }
                    }).catch(e=>{errorHandler('error within getting data from API SEARCHFOODHANDLER inside map  = = ='+e)})
            })


        }).catch(e=>{ res.render('result',{data:'',suggestions:'',id:id});})
    // loop on the urls then search inside the ingredients of them


}



function searchDrinkHandler(req, res) {
    let id = req.query.id; // send it within the render method to the result page...
    let firstIngredient = req.body.firstIngredient;
    let secondIngredient = req.body.secondIngredient;
    let thirdIngredient = req.body.thirdIngredient;
    let url=`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${firstIngredient}`;
    let searchByIdURL = ``;
    let gArr = [];
    let counter = 0; // to go throw the obeject of coocktail and get hte stringredent.
    let resultObjects = []; //objects has the ingredient.
    superagent.get(url)
        .then(result => result.body.drinks.map(element => element.idDrink))
        .then(result2 => result2.map((ele, idx) => `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${Number(result2[idx])}`))//get the links for each meal
        .then(urls => {
            let suggestions = [];
            let arr = urls.map((e, idxx) => { // will loop fo number of meals with 
                superagent.get(e)
                    .then(result4 => { // result4 is a meal we get it using ID 
                        let x = result4.body.drinks[0]; // object inside the value of meals(array)
                      
                    
                        if(  getDrinkIngredients(x).includes(secondIngredient) && getDrinkIngredients(x).includes(thirdIngredient)  ){

                            gArr.push(x);
                        }




                        counter++;
                        suggestions.push(x);
                        if (counter == urls.length - 1) {
                            // console.log(gArr)
                            resultObjects = gArr;
                            return [resultObjects, suggestions]; //return datafrom the second and third , from the first ingrefient;
                        }
                        else {
                            return false;
                        }

                    })
                    .then((result9, idx) => { //two arrayys one for the data and one for hte suggestions
                        if (result9) {
                            let dataArray = result9[0].map(element => new Drinks(element))
                            dataArray=dataArray.length? dataArray: '';
                            let suggestionsArray = result9[1].map(element => new Drinks(element))
                            suggestionsArray= suggestionsArray.length? suggestionsArray : '';
                            res.render('result',{data:dataArray,suggestions:suggestionsArray,id:id});
                                
                        }
                    }).catch(e=>{errorHandler('error within getting data from API SEARCHDRINKHANDLER inside the map  = = ='+e)})
            })


        }).catch(e=>{res.render('result',{data:'',suggestions:'',id:id});})
}


//helper functions
function getFoodIngredients(foodObject) {
    let counter = 1; //for getting the number beside ingredient word
    let ingredientString = [];

    let objects = Object.keys(foodObject).map(key => {
        if (key == `strIngredient${counter}`) {
            if (foodObject[key]) {
                ingredientString.push(foodObject[key] + ' ' + foodObject[`strMeasure${counter}`]);
            }
            counter++;
        }
    })

        return ingredientString.join(',');

   

}

function getDrinkIngredients(drinkObject) {
    let counter = 1; //for getting the number beside ingredient word
    let ingredientString = [];

    let objects = Object.keys(drinkObject).map(key => {
        if (key == `strIngredient${counter}`) {
            if (drinkObject[key]) {
                ingredientString.push(drinkObject[key] + ' ' + drinkObject[`strMeasure${counter}`]);
            }
            counter++;
        }
    })

        return ingredientString.join(',');

   

}







// all routes & error 
app.use(errorHandler);
app.get('*', anyRouteHandler)

// connection 
client.connect().then(() => {
    app.listen(PORT, () => { console.log(`Listening on ${PORT}`) })

}).catch((e)=>{errorHandler('error with connecting the database = = ='+e)})
