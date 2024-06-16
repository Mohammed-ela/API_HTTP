const express = require('express')
const router = express.Router()



router.get('/', (req, res) => {

    res.status(200).json({message:"la liste de mes abonements"})

});













module.exports = router;