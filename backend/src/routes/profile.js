const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name || null,
  });
});

module.exports = router;