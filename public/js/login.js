/* eslint-disable */

// ANCHOR -- Require Modules --
import axios from 'axios';
import { showAlert } from './alerts';

// ANCHORS -- FUNCTIONS --
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      // specify the data that we will send along with the request from the body
      data: {
        email: email,
        password: password,
      },
    });

    // if login was successful...
    if (res.data.status === 'success') {
      // create alert that tells user they are logged in
      showAlert('success', 'Logged in successfully!');
      // set timer for 1.5 seconds...
      window.setTimeout(() => {
        // redirect user to the home page after the timer is up
        location.assign('/');
      }, 1500);
    }
    // if login was not successful...
  } catch (err) {
    // sent alert to user with error message
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) {
      location.reload(true); // this forces a reload from the server and not from the browser cache
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again...');
  }
};
