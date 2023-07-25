import AppError from "../utils/error.util.js";
import  jwt  from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    
    const token = req.cookies.token || req.headers.Cookie;

    // const { token } = req.cookies['token'];

    if(!token) {
        return next(new AppError('Unauthenticated, please login again',404));
    }

    const userDetails = await jwt.verify( token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();

}

const authorizedRoles = (...roles) => async (req,res, next) => {
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)) {
        return next(
            new AppError('You donot have permission to access this role', 400)
        )
    }
    next();
}

 

export {
    isLoggedIn,
    authorizedRoles
}