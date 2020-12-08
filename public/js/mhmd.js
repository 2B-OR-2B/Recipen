"use strict";
$('#searchDrinkDiv').hide();
let shooDrinkFormbtn = $('.search-drink-btn');
console.log(shooDrinkFormbtn.html());
shooDrinkFormbtn.click(function () {
    console.log("hi");
    $('#searchDrinkDiv').show();
    $('#searchFoodDiv').hide();
})
let  showFoodFormBnt=$('.search-food-btn');
showFoodFormBnt.click(function(){
    $('#searchDrinkDiv').hide().animate({ opacity: 1,
        left: "+=50",
        height: "toggle"},5000,function(){});
    $('#searchFoodDiv').show().animate();
    console.log()
})
