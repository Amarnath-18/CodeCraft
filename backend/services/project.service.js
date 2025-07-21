import projectModel from "../models/project.model.js";
import User from "../models/user.model.js";

export const createProject = async (name, userId) => {
  if (!name) throw new Error("name is Required!!!");
  if (!userId) throw new Error("User is Required!!");
  console.log(name);

  // Create project with the creator as admin
  const project = await projectModel.create({
    name,
    users: [
      {
        user: userId,
        role: "admin",
      },
    ],
  });

  await User.findByIdAndUpdate(
    {
      _id:userId,
    },
    {
      $push: {
        projects: project._id ,
      },
    }
  );

  return project;
};

export const getProjectByUserId = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  const projects = await projectModel
    .find({ "users.user": userId })
    .populate("users.user"); // populate to get full user details

  if (projects.length === 0) {
    throw new Error("No projects found");
  }

  return projects;
};

export const addUserToProject = async (
  projectId,
  email,
  userId,
  role = "member"
) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!userId) throw new Error("Current user ID is required");

  const existingProject = await projectModel
    .findById(projectId)
    .populate("users");
  if (!existingProject) {
    const error = new Error("Project not found");
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with the given email");

  // Check if current user is an admin of the project

  console.log(existingProject);

  if (!existingProject.isUserAdmin(userId)) {
    const error = new Error("Only project admins can add users to the project");
    throw error;
  }

  // Check if the user is already in the project
  const isPresent = existingProject.users.some(
    (u) => u.user?.toString() === user._id.toString()
  );
  if (isPresent) {
    throw new Error("User is already in the project");
  }

  // Add new user to the project
  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    { $push: { users: { user: user._id, role } } },
    { new: true } // returns updated document if you want
  );
  await User.findByIdAndUpdate({_id:user._id},{
    $push:{
        projects:updateProject._id,
    }
  });

  return updatedProject;
};

export const getProjectById = async (projectId) => {
  if (!projectId) throw new Error("Project ID is required");

  const project = await projectModel
    .findById(projectId)
    .populate("users.user", "name email");

  if (!project) {
    const error = new Error("Project not found");
    error.name = "NotFoundError";
    throw error;
  }

  return project;
};

export const updateProject = async (projectId, name, userId) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!name) throw new Error("Project name is required");
  if (!userId) throw new Error("User ID is required");

  const existingProject = await projectModel.findById(projectId);

  if (!existingProject) {
    const error = new Error("Project not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Check if current user is an admin of the project
  if (!existingProject.isUserAdmin(userId)) {
    const error = new Error("Only project admins can update the project");
    error.name = "AuthorizationError";
    throw error;
  }

  existingProject.name = name;
  await existingProject.save();

  return existingProject;
};

export const removeUserFromProject = async (projectId, userToRemove, userId) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!userToRemove) throw new Error("User to remove is required");
  if (!userId) throw new Error("Current user ID is required");

  const existingProject = await projectModel.findById(projectId);
  if (!existingProject) {
    const error = new Error("Project not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Check if current user is an admin
  if (!existingProject.isUserAdmin(userId)) {
    const error = new Error("Only project admins can remove users from the project");
    error.name = "AuthorizationError";
    throw error;
  }

  const userIndex = existingProject.users.findIndex(
    (u) => u.user.toString() === userToRemove.toString()
  );

  if (userIndex === -1) {
    throw new Error("User is not part of this project");
  }

  // Prevent removing the last admin
  const adminCount = existingProject.users.filter((u) => u.role === "admin").length;
  const isRemovingAdmin = existingProject.users[userIndex].role === "admin";

  if (isRemovingAdmin && adminCount === 1) {
    throw new Error("Cannot remove the last admin from the project");
  }

  // 1. Remove user from project
  existingProject.users.splice(userIndex, 1);
  await existingProject.save();

  // 2. Remove project from user's project list
  await User.findByIdAndUpdate(userToRemove, {
    $pull: { projects: projectId }
  });

  return existingProject;
};

export const updateUserRole = async (
  projectId,
  targetUserId,
  newRole,
  currentUserId
) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!targetUserId) throw new Error("Target user ID is required");
  if (!newRole) throw new Error("New role is required");
  if (!currentUserId) throw new Error("Current user ID is required");
  if (!["admin", "member"].includes(newRole)) {
    throw new Error("Role must be either 'admin' or 'member'");
  }

  const existingProject = await projectModel.findById(projectId);

  if (!existingProject) {
    const error = new Error("Project not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Check if current user is an admin of the project
  if (!existingProject.isUserAdmin(currentUserId)) {
    const error = new Error("Only project admins can change user roles");
    error.name = "AuthorizationError";
    throw error;
  }

  // Find the target user
  const userIndex = existingProject.users.findIndex(
    (u) => u.user.toString() === targetUserId.toString()
  );

  if (userIndex === -1) {
    throw new Error("User is not part of this project");
  }

  const currentRole = existingProject.users[userIndex].role;

  // Prevent demoting the last admin
  if (currentRole === "admin" && newRole === "member") {
    const adminCount = existingProject.users.filter(
      (u) => u.role === "admin"
    ).length;
    if (adminCount === 1) {
      throw new Error(
        "Cannot demote the last admin. Promote another user to admin first."
      );
    }
  }

  // Update the role
  existingProject.users[userIndex].role = newRole;
  await existingProject.save();

  return existingProject;
};

export const getProjectStats = async (projectId) => {
  if (!projectId) throw new Error("Project ID is required");

  const project = await projectModel
    .findById(projectId)
    .populate("users.user", "name email");

  if (!project) {
    const error = new Error("Project not found");
    error.name = "NotFoundError";
    throw error;
  }

  const adminCount = project.users.filter((u) => u.role === "admin").length;
  const memberCount = project.users.filter((u) => u.role === "member").length;

  return {
    projectName: project.name,
    totalUsers: project.users.length,
    adminCount,
    memberCount,
    admins: project.users
      .filter((u) => u.role === "admin")
      .map((u) => ({
        id: u.user._id,
        name: u.user.name,
        email: u.user.email,
      })),
    members: project.users
      .filter((u) => u.role === "member")
      .map((u) => ({
        id: u.user._id,
        name: u.user.name,
        email: u.user.email,
      })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

