import express from 'express'
import { authUser } from '../middlewares/auth.js';
import { addUserToProjectController, createProjectController, getProjectByIdController, getProjectsController, updateProjectController, removeUserFromProjectController, updateUserRoleController, getProjectStatsController, deleteProjectController } from '../controllers/project.controller.js';
const router = express.Router();


router.post('/create' ,authUser , createProjectController);
router.get('/allProjects' , authUser , getProjectsController );
router.post('/addUserToPorject' , authUser , addUserToProjectController);
router.put('/update/:projectId' ,authUser , updateProjectController);
router.delete('/removeUser/:projectId' , authUser , removeUserFromProjectController);
router.put('/updateRole/:projectId' , authUser , updateUserRoleController);
router.get('/stats/:projectId' , authUser , getProjectStatsController);
router.get('/:projectId' , authUser , getProjectByIdController);
router.delete('/delete/:projectId' , authUser , deleteProjectController);
export default router;