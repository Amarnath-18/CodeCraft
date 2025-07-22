import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        lowercase: true,
        trim:true,
        required:true,
    },
    users:[
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role: {
                type: String,
                enum: ['admin', 'member'],
                default: 'member'
            }
        }
    ],
} , {timestamps:true})

// Helper method to check if user is admin
projectSchema.methods.isUserAdmin = function(userId) {
    console.log(userId);
    
    const userEntry = this.users.find(u => u.user.toString() === userId.toString());
    return userEntry && userEntry.role === 'admin';
};

// Helper method to get user role
projectSchema.methods.getUserRole = function(userId) {
    const userEntry = this.users.find(u => u.user.toString() === userId.toString());
    return userEntry ? userEntry.role : null;
};

const Project =  mongoose.model('Project' , projectSchema);

export default Project;