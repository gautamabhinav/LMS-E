import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
// import pkg from 'jsonwebtoken';
// const {JsonWebTokenError, jwt} = pkg;
import crypto from 'crypto';

import jwt from 'jsonwebtoken';
// const jwt = require('jsonwebtoken');
 // Add this import for jwt
// const bcrypt = require('bcrypt'); // Add this import for bcrypt

const userSchema = new Schema({
    fullName: {
        type: 'String',
        required: [true, 'Name is required'],
        minLength: [5, 'Name must be atleast 5 character'],
        maxLength: [50, 'Name should be less than 50 characters'],
        lowercase: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match:[ 
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
            'Please fill in a valid email address',
        ]
    },
    password: {
        type: 'String',
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be atleast 8 characters'],
        select: false,
    },
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
    generateJWTToken: async function() {
      return await jwt.sign(
        {
          id: this._id,
          email: this.email,
          subscription: this.subscription,
          role: this.role,
        },
        process.env.SECRET,
        {
          expiresIn: process.env.JWT_EXPIRY,
        }
      );
    },
    comparePassword: async function(plainTextPassword) {
      return await bcrypt.compare(plainTextPassword, this.password);
    },
  };

userSchema.methods = {
    generateJWTToken: async function() {
        return await jwt.sign(
          {
            id: this._id,
            email: this.email,
            subscription: this.subscription,
            role: this.role,
          },
          process.env.SECRET,
          {
            expiresIn: process.env.JWT_EXPIRY,
          }
        );
      },
    comparePassword: async function(plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password)
    },
    generatePasswordResetToken: async function() {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
        ;
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;  // 15 min from now

        return resetToken;
    }
}

const User = model('User', userSchema);

export default User;