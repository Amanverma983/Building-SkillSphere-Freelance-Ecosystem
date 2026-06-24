const axios = require('axios');

const test = async () => {
  try {
    console.log('Sending test login request to live Render backend...');
    const res = await axios.post('https://building-skillsphere-freelance-ecosystem.onrender.com/api/auth/login', {
      email: 'arjun@devmaster.in',
      password: 'Freelancer@123'
    });
    console.log('SUCCESS!');
    console.log('Status Code:', res.status);
    console.log('Response Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('FAILED!');
    if (err.response) {
      console.log('Status Code:', err.response.status);
      console.log('Response Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('Error Message:', err.message);
    }
  }
};

test();
