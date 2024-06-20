const express = require('express');
// Importation des contrôleurs
const {
    checkAuthPayload,
    checkEmailPayload,
    checkPasswordPayload,
    signupResponse,
    signinResponse,
    recoveryResponse,
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
        signinResponse
    );

// Route pour l'inscription
router.route('/inscription')
    .post(
        checkAuthPayload,
        checkEmailPayload,
        //check password
        checkPasswordPayload,
        signupResponse

    );
  // ----------------------------------------------------------------Recovery Password
  router.route('/recovery-password/')
        .post(
            checkEmailPayload,
            recoveryResponse,
            (req, res) => {
                //logique
      
              }
        );
    
    
    
    
                                    //------------------------------------------Si CONNECTE-----------------------------------------------------------------------//
    // ----------------------------------------------------------------User Info
  router.route('/user/:id')
        .get(
            extractUserInfo,
            (req, res) => {
                //logique
      
              }
        );


module.exports = router;
