// sign in and up 
'use strict';

const signupButton = document.getElementById('signup-button')
   const loginButton = document.getElementById('login-button')
   const  userForms = document.getElementById('user_options-forms')

/**
 * Add event listener to the "Sign Up" button
 */
signupButton.addEventListener('click', () => {
  userForms.classList.remove('bounceRight')
  userForms.classList.add('bounceLeft')
}, false)

/**
 * Add event listener to the "Login" button
 */
loginButton.addEventListener('click', () => {
  userForms.classList.remove('bounceLeft')
  userForms.classList.add('bounceRight')
}, false)

let isLoggedIn = document.getElementById('isLoggedIn').value;
let isRegistered = document.getElementById('isRegistered').value;


if( isLoggedIn === 'false'){
  
  alert('Email OR Password is wrong!');
}
if(isRegistered==='false'){
  alert('You already have registered with this email..');
}
console.log(isLoggedIn,'------',isRegistered);
