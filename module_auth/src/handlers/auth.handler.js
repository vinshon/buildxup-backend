const { signup, verifyOTP, verifyLogin, forgotPassword } = require('../controllers/auth.controller');

exports.signupHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const result = await signup(data);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

exports.verifyOTPHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const result = await verifyOTP(data);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

exports.loginHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const result = await verifyLogin(data);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};

exports.forgotPasswordHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const result = await forgotPassword(data);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};