/* eslint-disable */

const login = async (email, password) => {
  console.log(email, password);
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    console.log(result);
  } catch (err) {
    console.log(err.response.data);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault(); // prevents the form from loading any other page
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
