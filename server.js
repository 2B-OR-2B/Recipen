'use strict';

// app dependencies 
const express = require('express');
require('dotenv').config();
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const { search } = require('superagent');

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
app.get('/searchPage',searchPageHandler)
app.post('/searchFood',searchFoodHandler);
app.post('/searchDrink',searchDrinkHandler);
app.post('/details', detailsHandler);
app.post('/saveFood',saveFoodHandler);
app.post('/saveDrink',saveDrinkHandler);
//temporary rout
app.get('/testResult', (req, res) => {
    res.render('result', {
        data: '', suggestions: [
            {
                id: '111',
                name: 'Mandi',
                ingredients: 'aaaaaaaa,aaaaaa,aaaaaa,aaaaaa',
                steps: `Mix the cornflour and 1 tbsp soy sauce, toss in the prawns and set aside for 10 mins. Stir the vinegar, remaining soy sauce, tomato purée, sugar and 2 tbsp water together to make a sauce.\r\n\r\nWhen you’re ready to cook, heat a large frying pan or wok until very hot, then add 1 tbsp oil. Fry the prawns until they are golden in places and have opened out– then tip them out of the pan.\r\n\r\nHeat the remaining oil and add the peanuts, chillies and water chestnuts. Stir-fry for 2 mins or until the peanuts start to colour, then add the ginger and garlic and fry for 1 more min. Tip in the prawns and sauce and simmer for 2 mins until thickened slightly. Serve with rice`,
                img_url: 'https://via.placeholder.com/300',
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

function signUpHandler(req,res){

/*     1 get: user data ( id ,fName, lName, email, password)
       2 query to insert the user
       3 redirect to singIn
*/
    const {firstName,lastName,email,pass}=req.body;
    let SQL = `INSERT INTO users (firstName,lastName,email,password) VALUES ($1,$2,$3,$4) RETURNING *;`;
    let values = [firstName, lastName, email, pass];
    client.query(SQL, values).then(data => {
        res.render('index', { user: data.rows[0] })

    })
        .catch(e => { errorHandler(`Email is already exists..${e}`, req, res) })
    // front end check the type of response.. ( string (error) OR object )



}

function detailsHandler(req, res) {
    
    res.render('detailsResults', { obj: req.body })
}

function homePageHandler(req,res){
    let urlFood=`https://www.themealdb.com/api/json/v1/1/random.php`;
    let cocktailUrl=`https://www.thecocktaildb.com/api/json/v1/1/random.php`;
    let dessertUrl=`https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert`;
    
    superagent.get(urlFood).then(foodResult=>{
        superagent.get(cocktailUrl).then(cocktailResult=>{
            superagent.get(dessertUrl).then(dessertResult=>{
                res.render('index', {cocktail:cocktailResult.body,food:foodResult.body,dessert:dessertResult.body})
            })
        })
    })
    }

function saveFoodHandler(req,res){
    let {id,name,ingredients,steps,img_url,vid_url,category,area} = req.body;
    let SQL = 'INSERT INTO foods VALUES ($1,$2,$3,$4,$5,$6,$7,$8)';
    let values=[id,name,ingredients,steps,img_url,vid_url,category,area];
    client.query(SQL,values).then(()=>{
        
        let SQL='SELECT food_id FROM fav_foods WHERE user_id = $1 ;';
        let values=[id];
        client.query(SQL).then(result=>{
            res.render('result',{favFood:result.rows })

        }
        )
    })
}
function saveDrinkHandler(req,res){
    let {id,name,ingredients,steps,img_url,vid_url,category} = req.body;
    let SQL = 'INSERT INTO drinks VALUES ($1,$2,$3,$4,$5,$6,$7)';
    let values=[id,name,ingredients,steps,img_url,vid_url,category];

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
    this.vid_url = foodObj.strYoutube ? foodObj.strYoutube : '';
    this.type = 'food';
}


function Drinks(drinkObj) {
    this.drink_id = drinkObj.idDrink;
    this.name = drinkObj.strDrink;
    this.ingredients = getDrinkIngredients(drinkObj);
    this.steps = drinkObj.strInstructions ? drinkObj.strInstructions : 'There is no instructions';
    this.img_url = drinkObj.strDrinkThumb ? drinkObj.strDrinkThumb : 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80';
    this.category = drinkObj.strCategory ? drinkObj.strCategory : 'No Category';
    this.vid_url = drinkObj.strVideo ? drinkObj.strVideo : '';
    this.type = 'drink';
}


function searchPageHandler(req,res){
res.render('search');
}


function searchFoodHandler(req,res){
    // req.body()=> data from form
    let firstIngredient=req.body.firstIngredient;
    let secondIngredient=req.body.secondIngredient;
    let thirdIngredient=req.body.thirdIngredient;
    let url=`https://www.themealdb.com/api/json/v1/1/filter.php?i=${firstIngredient}`;
    let searchByIdURL=``;
    let gArr=[];
    let newgArr=[];
    superagent.get(url)
    .then(result=>result.body.meals.map(element=>element.idMeal))
   
    .then(result2=>result2.map((ele,idx)=>`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${Number(ele)}`))//get the links for each meal
    .then(urls=>{
        let arr=urls.map((e,idxx)=>{ // will loop fo number of meals with 
            superagent.get(e)
            .then(result4=>{ // result4 is a meal we get it using ID 
                let x = result4.body.meals[0]; // object inside the value of meals(array)
                //     let y=reg.test(key)
                let keys = Object.keys(x);
                let ingArr=[];
                let counter=1;
                keys.forEach((key)=>{
                    if(key.includes(`strIngredient${counter}`)){
                        ingArr.push(x[key]);
                        counter++;
                    }
                    
                })
                

                
            //     let zero=0;
            //     for(let i=0; i<20;i++){
            //         if(x[`strIngredient${zero}`]==secondIngredient || x[`strIngredient${zero}`]==thirdIngredient){
            //             // console.log(x[`strIngredient${zero}`],x.strMeal);
            //             if(x[`strIngredient${zero}`]){
            //             gArr.push(x[`strIngredient${zero}`])
            //             }
                    
            //         }
            //     }
            //     zero++;
            // console.log(gArr)
            // //     if(idxx==urls.length-1){
            // //    console.log('hi1221')
            // //     }
            }).then(testvar=>{
                // console.log(testvar,1212121)
            })
        })
       
    })
// loop on the urls then search inside the ingredients of them


}



function searchDrinkHandler(req,res){
    
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

