const express = require("express");
//const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// SIGNUP
router.post('/signup', authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// ABOUT PASSWORD
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// authcontroller.protect this will do is to basically protect all the routes that come after this point. That's because middleware runs in sequence.
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);
// UPDATE ME
// router.patch(
//   "/updateMe",
//   userController.uploadLogo,
//   userController.saveLogo,
//   userController.updateMe
// );
// router.delete("/deleteMe", userController.deleteMe);
// router.patch("/activeMe", userController.activeMe);
// router.get("/me", userController.getMe, userController.getUser);

// router.use(authController.restrictTo("admin"));

// router.post("/createUser", authController.createUser);
// router.post("/signUp", authController.signUp);
// // REST FORMAT because possibility of a system administrator updating, deleting, getting all the users based on their ID.
// router
//   .route("/")
//   .get(userController.getAllUsers)
//   .post(userController.createUser);
// router
//   .route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
