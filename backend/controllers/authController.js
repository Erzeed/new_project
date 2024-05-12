const { promisify } = require('util');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Log = require('../models/logModel');
const catchAsync = require('../utils/catchAsync');
//const sendEmail = require('../utils/email');
const crypto = require('crypto');


const signToken = (id) =>
  // jwt.sign(payload, secretOrPrivateKey, [options, callback])

  // Payload contains the claims. Claims are statements about an entity (typically, the user) and additional data. {id}: Only want entity of user Id

  // JWT_SECRET: The algorithm ( HS256 ) used to sign the JWT means that the secret is a symmetric key that is known by both the sender and the receiver. It is negotiated and distributed out of band. Hence, if you're the intended recipient of the token, the sender should have provided you with the secret out of band.

  // JWT_EXPIRES_IN: For logging out a user after a certain period of time. Treated as milliseconds.

  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    // A cookie with the Secure attribute is only sent to the server with an encrypted request over the HTTPS protocol. It's never sent with unsecured HTTP (except on localhost), which means man-in-the-middle attackers can't access it easily. Insecure sites (with http: in the URL) can't set cookies with the Secure attribute. However, don't assume that Secure prevents all access to sensitive information in cookies. For example, someone with access to the client's hard disk (or JavaScript if the HttpOnly attribute isn't set) can read and modify the information.

    // secure: true, // cookie will be sent only on an encrypted connection (HTTPS)

    domain: process.env.SERVER_URL.split('/')[2],
    httpOnly: true,
    sameSite: 'Lax', // cookie cant be accessed or modified in any way by the browser prevent cross-site scripting attacks
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // will set secure to true if in the production environment

  // SEND COOKIE
  // res.cookie("name-of-cookie", data-wanna-send, options-of-cookie)
  res.cookie('jwt', token, cookieOptions);
  res.cookie('userId', `${user._id}`, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    // JWT.SIGN here we send token to client
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    nik: req.body.nik,
    dept: req.body.dept,
    alias: req.body.alias,
    company: req.body.company,

    // Basically we only allow the data that we actually need to be put into the new user. no longer register as an admin. So if want to add admin we should direct to database
    role: req.body.role,
  });

  // log user
  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  await Log.create({
    user: newUser._id,
    activity: 'signUp',
    ipAddress: ip,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //  because the variable name and the name from req.body its same we can destructuring object
  const { email, password } = req.body;

  //   1) Check if email and pass exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //   2) Check if the user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password'); // select using + bcs the select is false before

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // log user
  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  await Log.create({
    user: user.id,
    activity: 'login',
    ipAddress: ip,
  });

  //   3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //  1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      console.log(currentUser);
      // log user
      const ip =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
      await Log.create({
        user: currentUser._id,
        activity: 'logout',
        ipAddress: ip,
      });
    } catch (err) {
      return next();
    }
  }

  await res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  await res.cookie('userId', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(400).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // console.log(`protect: `, req.cookies);

  // 1) Getting to token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // console.log(req.cookies);
  // console.log('this is protect');

  if (!token) {
    return next(
      new AppError(
        'You are not loggged in! Please logged in to get access.',
        401
      )
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  // 3) Check if user still exists

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist.')
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  next();
});


// Only for rendered pages, no errors!. So we'll use try catch and return next, no need catchAsync
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// EXAMPLE FOR FUNCTION THAT PASS ARGUMENTS
exports.restrictTo =
  (...roles) =>
    (req, res, next) => {
      // console.log(req)
      // roles ['admin', 'lead-guide']

      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      next();
    };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  await Log.create({
    user: user._id,
    activity: 'forgotPassword',
    ipAddress: ip,
  });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) Update changePassword property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  await Log.create({
    user: user._id,
    activity: 'resetPassword',
    ipAddress: ip,
  });

  // 4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // console.log(req.user.id);

  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password'); // select using + bcs the select is false before
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Check if POSTed cusrrent password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('Your current password is wrong!', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // create log
  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  await Log.create({
    user: user._id,
    activity: 'updatePassword',
    ipAddress: ip,
  });

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});


exports.createUser = catchAsync(async (req, res, next) => {
  console.log(req.body)

  // 1) Getting to token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(req.cookies);
  // console.log('this is protect');

  if (!token) {
    return next(
      new AppError(
        'You are not loggged in! Please logged in to get access.',
        401
      )
    );
  }
  // console.log("sampe ga?")


  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  console.log({ currentUser })
  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  await Log.create({
    user: currentUser._id,
    activity: 'Create User',
    ipAddress: ip,
  });

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    nik: req.body.nik,
    dept: req.body.dept,
    alias: req.body.alias,
    company: req.body.company,

    // Basically we only allow the data that we actually need to be put into the new user. no longer register as an admin. So if want to add admin we should direct to database
    // role: req.body.role,
  });

  const emitSocket = await newUser.emitSocket()

  // log user
  return res.status(200).json({
    status: 'success',
    data: newUser,
  });
});