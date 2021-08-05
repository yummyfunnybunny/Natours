/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// ANCHOR -- Update Account Info --
// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    // Set the url based on the 'type' parameter
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);

      // refresh the window aftert 1 second once the data was updated successfully
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
