const express = require('express');
const {
    createAccount,
    getAccountById,
    getAccountByUsername,
    signInWithUsernameAndPassword

 } = require('../..//db/account/account')

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to accounts API'
    })
});


router.post('/accounts', async (req, res) => {
    try {
      const { username, password } = req.body;
      const accountId = await createAccount({ username, password });
      res.status(201).json({ id: accountId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Unable to create account, maybe the username is taken' });
    }
  });
  
  // Route to get an account by ID
  router.get('/accounts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const account = await getAccountById({ id });
      if (account.length > 0) {
        //do not return password
        delete account[0].password;
        res.json(account[0]);
      } else {
        res.status(404).json({ error: 'Account not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Unable to get account' });
    }
  });
  
  // Route to get an account by username
  router.get('/accounts/username/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const account = await getAccountByUsername({ username });
      if (account.length > 0) {
        delete account[0].password;
        res.json(account[0]);
      } else {
        res.status(404).json({ error: 'Account not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Unable to get account' });
    }
  });
  
  // Route to sign in with username and password
  router.post('/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
      const token = await signInWithUsernameAndPassword({ username, password });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Unable to sign in' });
    }
  });
  

module.exports = router;