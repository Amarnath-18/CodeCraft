# Project Admin Functionality

## Overview
This implementation adds admin-only functionality to the project management system. Only users with admin role can perform certain operations like adding users, editing project names, and removing users.

## Key Features

### 1. Role-Based Access Control
- **Admin Role**: Can perform all project operations including:
  - Adding new users to the project
  - Removing users from the project
  - Updating project name
  - Changing user roles (promote/demote)
  
- **Member Role**: Can only view the project and its contents

### 2. Admin Creation
- When a project is created, the creator is automatically assigned as an admin
- Projects must always have at least one admin

### 3. Admin Protection
- Cannot remove the last admin from a project
- Cannot demote the last admin to member (must promote someone else first)

## API Endpoints

### Create Project
```
POST /api/projects/create
```
- Creates a new project with the creator as admin
- Requires authentication

### Add User to Project (Admin Only)
```
POST /api/projects/addUserToPorject
Body: {
  "projectId": "string",
  "users": ["userId1", "userId2"],
  "role": "admin" | "member" (optional, defaults to "member")
}
```

### Update Project Name (Admin Only)
```
PUT /api/projects/update/:projectId
Body: {
  "name": "New Project Name"
}
```

### Remove User from Project (Admin Only)
```
DELETE /api/projects/removeUser/:projectId
Body: {
  "userToRemove": "userId"
}
```

### Update User Role (Admin Only)
```
PUT /api/projects/updateRole/:projectId
Body: {
  "targetUserId": "userId",
  "newRole": "admin" | "member"
}
```

### Get Project Statistics
```
GET /api/projects/stats/:projectId
```
Returns project stats including admin count, member count, and user lists.

### Get Project Details
```
GET /api/projects/:projectId
```

### Get User's Projects
```
GET /api/projects/allProjects
```

## Database Schema Changes

### Project Model
```javascript
{
  name: String,
  users: [{
    user: ObjectId (ref: "User"),
    role: String (enum: ['admin', 'member'], default: 'member')
  }],
  timestamps: true
}
```

### Helper Methods
- `isUserAdmin(userId)`: Checks if a user is an admin of the project
- `getUserRole(userId)`: Returns the role of a user in the project

## Security Features

1. **Authorization Checks**: All admin-only operations verify that the requesting user is an admin
2. **Input Validation**: All inputs are validated for type and format
3. **Admin Protection**: Prevents removal of last admin
4. **Role Validation**: Ensures roles are valid enum values

## Error Handling

- **403 Forbidden**: When non-admin tries to perform admin operations
- **404 Not Found**: When project or user doesn't exist
- **400 Bad Request**: For invalid input data
- **500 Internal Server Error**: For unexpected server errors

## Usage Examples

### Frontend Integration
```javascript
// Add user as admin
const response = await axios.post('/api/projects/addUserToPorject', {
  projectId: 'project123',
  users: ['user456'],
  role: 'admin'
});

// Remove user (admin only)
const response = await axios.delete('/api/projects/removeUser/project123', {
  data: { userToRemove: 'user456' }
});

// Update user role (admin only)
const response = await axios.put('/api/projects/updateRole/project123', {
  targetUserId: 'user456',
  newRole: 'member'
});
```

## Migration Notes

If you have existing projects in your database, you may need to run a migration to:
1. Convert existing user arrays to the new user object format
2. Assign admin roles to project creators
3. Set default member roles for other users

Example migration script:
```javascript
// This would need to be run once to migrate existing data
const projects = await Project.find({});
for (const project of projects) {
  if (project.users.length > 0 && typeof project.users[0] === 'string') {
    // Convert old format to new format
    const updatedUsers = project.users.map((userId, index) => ({
      user: userId,
      role: index === 0 ? 'admin' : 'member' // First user becomes admin
    }));
    project.users = updatedUsers;
    await project.save();
  }
}
```
