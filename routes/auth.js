import express from 'express'; 
const router = express.Router();

router.get('/config', (req, res) => {
    res.json({
        success: true,
        clientId: process.env.PHONE_EMAIL_CLIENT_ID
    });
});

export default router; 
