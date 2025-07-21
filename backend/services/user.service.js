import UserModel from "../models/user.model.js";


export const createUser = async ({email , password})=>{
    try {
        if(!email || !password) throw new Error("All Fields are Required!!");
        const hashedPassword = await UserModel.hashPassword(password);
        const newUser = await UserModel.create({
            email,
            password: hashedPassword,
        });

        return newUser;
        
    } catch (error) {
        throw error;
    }
}

export const loginUser = async({email , password})=>{
    try {

        const user = await UserModel.findOne({email}).select('+password').populate('projects');
        if(!user) throw new Error("User Not Found!!!");
        
        const isValidPassword = await user.isValidPassword(password);
        if(!isValidPassword) throw new Error("Invalid Credentials!!!");
        
        return user;
    } catch (error) {
        throw error;
    }
}

export const getAllUsers = async({userId})=>{
    console.log('getAllUsers called with userId:', userId); // Debug log
    
    if (!userId) {
        throw new Error("User ID is required to fetch other users");
    }
    
    const allUsers = await UserModel.find({
        _id:{
            $ne: userId,
        }
    }).populate('projects');

    console.log('Found users count:', allUsers.length); // Debug log
    return allUsers;
}