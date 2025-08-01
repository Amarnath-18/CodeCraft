import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = mongoose.Schema({
    email:{
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type: String,
        select: false,
    },
    projects:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Project"
        }
    ],
    deployments: [{
        projectName: String,
        platform: String,
        url: String,
        deploymentId: String,
        deployedAt: { type: Date, default: Date.now }
    }]
});

userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password , 10);
};

userSchema.methods.isValidPassword = async function (password) {
    console.log(password , this.password);
    return bcrypt.compare(password , this.password);
}

userSchema.methods.genJWT = function (){
    return jwt.sign({email: this.email, userId: this._id} , process.env.JWT_SECRET);
}

const User = mongoose.model("User" , userSchema);
export default User;
