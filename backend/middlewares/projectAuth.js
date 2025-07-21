import Project from '../models/project.model.js';

// Middleware to check if user is an admin of the project
export const checkProjectAdmin = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required"
            });
        }

        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check if user is an admin of this project
        if (!project.isUserAdmin(userId)) {
            return res.status(403).json({
                success: false,
                message: "Only project admins can perform this action"
            });
        }

        // Add project to req for use in controller
        req.project = project;
        next();
    } catch (error) {
        console.error('Project admin check error:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while checking project permissions"
        });
    }
};

// Middleware to check if user is a member of the project
export const checkProjectMember = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required"
            });
        }

        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check if user is a member of this project
        const isMember = project.users.some(u => u.user.toString() === userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this project"
            });
        }

        // Add project to req for use in controller
        req.project = project;
        next();
    } catch (error) {
        console.error('Project member check error:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while checking project permissions"
        });
    }
};
