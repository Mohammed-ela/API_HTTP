const express = require('express');
// Importation des contrôleurs
const {
    checkAuthPayload,
    checkEmailPayload,
    checkPasswordPayload,
    signupResponse,
    signinResponse,
    recoveryResponse,
    newPasswordResponse,
    extractUserInfo

} = require('../controllers/UserControllers.js');

// Création du routeur
const router = express.Router();

// Route pour la connexion
router.route('/connexion')
    .post(
        //check email & mdp
        checkAuthPayload,
        //check email
        checkEmailPayload,
        //le login
        signinResponse
    );

// Route pour l'inscription
router.route('/inscription')
    .post(
        checkAuthPayload,
        checkEmailPayload,
        //check password
        checkPasswordPayload,
        //la connexion
        signupResponse

    );
  // ----------------------------------------------------------------Recovery Password
  router.route('/recovery-password/')
        .post(
            //check email
            checkEmailPayload,
            recoveryResponse
        );
// ----------------------- update password link
        router.route('/new-password/:slug')
        .post(
            newPasswordResponse
        );
    
    
    
                                    //------------------------------------------Si CONNECTE-----------------------------------------------------------------------//
    // ----------------------------------------------------------------User Info
  router.route('/user/:id')
        .get(
            extractUserInfo
        );


module.exports = router;
