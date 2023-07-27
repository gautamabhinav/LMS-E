import { Router } from 'express';
import { allPayments, buySubcription, cancelSubcription, getRazorpayApiKey, verifySubcription } from '../controllers/payment.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router
    .route('/razorpay-key')
    .get(
        isLoggedIn,
        getRazorpayApiKey
    );

router
    .route('/subscribe')
    .post(
        isLoggedIn,
        buySubcription
    );

router
    .route('/verify')
    .post(
        isLoggedIn,
        verifySubcription
    );

router
    .route('/unsubscribe')
    .post(
        isLoggedIn,
        cancelSubcription
    );

router
    .route('/')
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        allPayments
    );

export default router;