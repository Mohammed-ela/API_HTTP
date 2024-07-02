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
    isconnected,
    extractUserInfo,
    getUserInfo,
    updateUserResponse

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
            //check email s'il existe en bdd
            checkEmailPayload,
            // prend l'email et envois le link de reset a l'email
            recoveryResponse
        );
// ----------------------- update password link
        router.route('/new-password/:slug')
        .post(
            newPasswordResponse
        );
    
    
    
                                    //------------------------------------------Si CONNECTE-----------------------------------------------------------------------//
    // ----------------------------------------------------------------User Info
    router.route('/profile')
    .get(
        // middleware si on est connecté ? + recup id
        isconnected,
        // recherche user en fct de id 
        extractUserInfo,
        // afficher info user 
        getUserInfo
    );
//---------------------- update
    router.route('/profile/update')
    .put(

        isconnected,
        
        extractUserInfo,
      
        updateUserResponse
    );

module.exports = router;
