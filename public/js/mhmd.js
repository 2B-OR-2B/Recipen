// "use strict";
// let showDrinkFormbtn = $('.search-drink-btn');
// console.log(showDrinkFormbtn.html());
// showDrinkFormbtn.click(function () {
    //     console.log("hi");
    // $('#searchDrinkDiv').show();
    // $('#searchFoodDiv').hide();
    // })
    // let  showFoodFormBnt=$('.search-food-btn');
    // showFoodFormBnt.click(function(){
        // $('#searchDrinkDiv').hide().animate({ opacity: 1,},2000,function(){});
        // $('#searchFoodDiv').show().animate();
        //     console.log()
        // })
        
        
        
// $('#searchDrinkDiv').hide();
$('.searchForms').flip({
    axis:'y',
    trigger:'manual',
    reverse:false,
    speed:2.6
});
// $("div").fadeToggle(1000);

$(".search-drink-btn").click(function() {
  $('#searchDrinkDiv').fadeIn(1000);
  $('#searchFoodDiv').fadeOut(1000);
    $(this)
      .closest(".searchForms")
      .flip(true);
     
  });
  
  $(".search-food-btn").click(function() {
    $('#searchDrinkDiv').fadeOut(1000);
    $('#searchFoodDiv').fadeIn(1000);
    $(this)
      .closest(".searchForms")
      .flip(false);
    //   $('#searchDrinkDiv').append('.searchFoodDiv');
  });



