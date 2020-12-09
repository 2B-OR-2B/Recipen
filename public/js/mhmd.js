"use strict";

        
        
        
// $('#searchDrinkDiv').hide();
$('.searchForms').flip({
    axis:'y',
    trigger:'manual',
    reverse:false,
    speed:1500
});
// $("div").fadeToggle(1000);

$(".search-drink-btn").click(function() {
    $(this)
      .closest(".searchForms")
      .flip(true);
     
  });
  
  $(".search-food-btn").click(function() {
 
    $(this)
      .closest(".searchForms")
      .flip(false);

  });



