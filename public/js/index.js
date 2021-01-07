/* eslint-disable */

// ANCHOR -- import modules --
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';

// ANCHOR -- Set DOM Elements --
// saves all of the elements that we will need to interact with
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// ANCHOR -- Aquire Locations --
// save all of the locations from the tour into the const 'locations
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevents the form from loading any other page
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
