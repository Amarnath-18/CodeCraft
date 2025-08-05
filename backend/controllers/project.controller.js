import { addUserToProject, createProject, getProjectByUserId, getProjectById, updateProject, removeUserFromProject, updateUserRole, getProjectStats, deleteProject } from "../services/project.service.js";

export const createProjectController = async(req, res) => {
    try {
        const { name } = req.body;
        console.log(name);
        
        // Input validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Project name is required and must be a non-empty string"
            });
        }

        // Sanitize the input by trimming whitespace
        const sanitizedName = name.trim();
        
        const {userId} = req.user;        
        
        const newProject = await createProject(sanitizedName, userId);
        
        // Use 201 status code for successful creation
        return res.status(201).json({
            success: true,
            message: "Project Created Successfully",
            project: newProject
        });
    } catch (error) {
        // Log error for debugging but don't expose internal error details to client
        console.error('Project creation error:', error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Invalid project data provided"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the project"
        });
    }
}

export const getProjectsController  = async(req , res)=>{
    try {
        const {userId} = req.user;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (typeof userId !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        const Projects = await getProjectByUserId(userId);
        if (!Projects || !Array.isArray(Projects)) {
            return res.status(404).json({
            success: false,
            message: "No projects found or invalid data format"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully",
            projects: Projects
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
            success: false,
            message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching the projects"
        });
    }
}

export const addUserToProjectController = async(req , res)=>{
    try {
        const { email, projectId, role = 'member' } = req.body;
        const {userId} = req.user;

        // Validate required fields
        if (!email || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Email and project ID are required."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || email.trim().length === 0 || !emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        // Validate projectId type
        if (typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        // Validate role
        if (role && !['admin', 'member'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be either 'admin' or 'member'"
            });
        }

        const updatedProject = await addUserToProject(projectId, email.trim(), userId, role);

        return res.status(200).json({
            success: true,
            message: "User added to project successfully",
            project: updatedProject
        });

    } catch (error) {
        console.error('Error adding user to project:', error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getProjectByIdController = async(req , res)=>{
    try {
        const { projectId } = req.params;
        const { userId } = req.user;
        
        // Validate project ID
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid project ID is required"
            });
        }

        // Get the project from database
        const project = await getProjectById(projectId);

        // Check if project exists
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check if user has access to this project
        const hasAccess = project.users.some(u => u.user && u.user._id && u.user._id.toString() === userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this project"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project retrieved successfully",
            project
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const updateProjectController = async(req , res)=>{
    try {
        const { projectId } = req.params;
        const { name } = req.body;
        const { userId } = req.user;

        // Validate project ID
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid project ID is required"
            });
        }

        // Validate name
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Project name is required and must be a non-empty string"
            });
        }

        // Sanitize the input
        const sanitizedName = name.trim();

        // Update the project
        const updatedProject = await updateProject(projectId, sanitizedName, userId);

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const removeUserFromProjectController = async(req, res) => {
    try {
        const { projectId } = req.params;
        const { userToRemove } = req.body;
        const { userId } = req.user;
        

        // Validate project ID
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid project ID is required"
            });
        }

        // Validate user to remove
        if (!userToRemove || typeof userToRemove !== 'string' || userToRemove.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid user ID to remove is required"
            });
        }

        // Remove user from project
        const updatedProject = await removeUserFromProject(projectId, userToRemove, userId);

        return res.status(200).json({
            success: true,
            message: "User removed from project successfully",
            project: updatedProject
        });
    } catch (error) {
        console.error('Error removing user from project:', error);

        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.name === 'AuthorizationError') {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while removing user from project"
        });
    }
}

export const updateUserRoleController = async(req, res) => {
    try {
        const { projectId } = req.params;
        const { targetUserId, newRole } = req.body;
        const { userId } = req.user;

        // Validate project ID
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid project ID is required"
            });
        }

        // Validate target user ID
        if (!targetUserId || typeof targetUserId !== 'string' || targetUserId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid target user ID is required"
            });
        }

        // Validate new role
        if (!newRole || !['admin', 'member'].includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: "Role must be either 'admin' or 'member'"
            });
        }

        // Update user role
        const updatedProject = await updateUserRole(projectId, targetUserId, newRole, userId);

        return res.status(200).json({
            success: true,
            message: `User role updated to ${newRole} successfully`,
            project: updatedProject
        });
    } catch (error) {
        console.error('Error updating user role:', error);

        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.name === 'AuthorizationError') {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while updating user role"
        });
    }
}

export const getProjectStatsController = async(req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;

        // Validate project ID
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid project ID is required"
            });
        }

        // Get project stats
        const stats = await getProjectStats(projectId);

        return res.status(200).json({
            success: true,
            message: "Project statistics retrieved successfully",
            stats: stats
        });
    } catch (error) {
        console.error('Error getting project stats:', error);

        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while retrieving project statistics"
        });
    }
}

export const deleteProjectController = async(req , res)=>{
    try {
        const { projectId } = req.params;
        const { userId } = req.user;

        // Validate project ID
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid project ID is required"
            });
        }

        // Delete project
        const deleted = await deleteProject(projectId, userId);
        if(!deleted) return res.status(500).json({
            success: false,
            message: "Failed to delete project"
        });

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while deleting project"
        });
    }
}
