import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";

export const getRazorpayApiKey = async(req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Razarpay API key',
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
   
}

export const buySubcription = async(req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        
        if(!user) {
            return next(
                new AppError('Unauthorized, please login'),
            )
        }

        if (user.role === 'ADMIN') {
            return next(
                new AppError(
                    'Admin cannot purchase a subscription', 400
                )
            )
        }

        const subscription =  razorpay.subscriptions.create({
            plain_id: process.env.RAZORPAY_PLAIN_ID,
            customer_notify: 1
        });

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscribed Successfully',
            subscription_id: subscription.id
        });
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
    
}

export const verifySubcription = async(req, res, next) => {
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

        const user = await User.findById(id);

        if(!user) {
            return next(
                new AppError('Unauthorized, please login'),
            )
        }

        const subscriptionId = user.subscription.id;

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');

        if (generatedSignature != razorpay_signature) {
            return next(
                new AppError('Payment not verified, please try again', 500)
            )
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id,
        });

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified Successfully!'
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
    
}

export const cancelSubcription = async(req, res, next) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if(!user) {
            return next(
                new AppError('Unauthorized, please login'),
            )
        }

        if (user.role == 'ADMIN') {
            return next(
                new AppError(
                    'Admin cannot purchase a subscription', 400
                )
            )
        }

        const subscriptionId = user.subscription.id;

        const subscription = await razorpay.subscriptions.cancel(
            subscriptionId
        )

        user.subscription.status = subscription.status;

        await user.save();

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}

export const allPayments = async(req, res, next) => {
    try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10,
        });


        res.status(200).json({
            status: true,
            message: 'All payments',
            subscriptions
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}



