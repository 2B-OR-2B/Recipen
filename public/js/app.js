'use strict';
let ul = document.getElementById('clickable');
let id = document.getElementById('userID')?document.getElementById('userID').value :'';

if(ul){
    ul.addEventListener('click',(e)=>{
        console.log(e.target.id)
        if(e.target.id!=='clickable' && e.target.id !=='homeLink' && !id  ){
            alert('Sorry, You need to log in first..');
        }
        else if (e.target.id === 'homeLink'){
            window.open(`/?id=${id}`,'_self');
        }
        else if (e.target.id === 'searchLink' && id){
            window.open(`/searchPage?id=${id}`,'_self');
        }
        else if (e.target.id === 'favLink' && id){
            window.open(`/fav?id=${id}`,'_self');
        }
         
    })

}