/* eslint-disable */

// ANCHOR -- import modules --
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
// import { signup } from '../../controllers/authController';
import { signup } from './signup';

// ANCHOR -- Set DOM Elements --
// saves all of the elements that we will need to interact with
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// ANCHOR -- Aquire Locations --
// save all of the locations from the tour into the const 'locations
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  console.log('signup form submitted');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevents the form from loading any other page
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  console.log('signup form submitted');
  signupForm.addEventListener('submit', (e) => {
    console.log('yippieee');
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords do not match! Please retry...');
    } else {
      console.log('signup 1');
      signup(name, email, password, passwordConfirm);
    }
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // create a FormData object that we can use to append multiple types of data to
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // set the 'save password' button to  'updating...' while the await is being performed
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    // save the input values from the password reset form
    const passwordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm')
      .value;
    // call the 'updateSettings' function with the new password info
    await updateSettings(
      { passwordCurrent, newPassword, newPasswordConfirm },
      'password'
    );

    // reset the 'save password' button to its original text after completing the await
    document.querySelector('.btn--save-password').textContent = 'Save password';

    // reset the password fields to empty after we're done
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    // console.log(`BookBtn Click: ${tourId}`);
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
