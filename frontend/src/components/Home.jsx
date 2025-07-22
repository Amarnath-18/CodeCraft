import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import axiosInstance from '../config/AxiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const Home = () => {
  const [isModelOpen , setIsModalOpen] = useState(false);
  const [isEditModalOpen , setIsEditModalOpen] = useState(false);
  const [formName , setFormName] = useState("");
  const [editFormName , setEditFormName] = useState("");
  const [editingProject , setEditingProject] = useState(null);
  const {projects , setProjects , loading} = useContext(UserContext);
  const navigate = useNavigate();
  const getProjects = async () => {
    try {
      const response = await axiosInstance.get('/project/allProjects', { withCredentials: true });
      // toast.success("Projects fetched successfully");
      console.log("Response data:", response.data);
      setProjects(response.data.projects || response.data);
    } catch (error) {
      console.log("Error fetching projects:", error);
      // toast.error(error.response?.data?.message || 'Failed to fetch projects');
    }
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/project/create" , {name:formName} , {withCredentials:true});
      if(response.data.success){
        toast.success('Project created successfully!');
        setIsModalOpen(false);
        setFormName("");
        await getProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project);
    setEditFormName(project.name);
    setIsEditModalOpen(true);
  }

  const handleEditSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/project/update/${editingProject._id}`, 
        {name: editFormName}, 
        {withCredentials: true}
      );
      if(response.data.success){
        toast.success('Project updated successfully!');
        setIsEditModalOpen(false);
        setEditFormName("");
        setEditingProject(null);
        await getProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  }

  const handleDeleteProject = async(projectId) => {
    try {
      const response = await axiosInstance.delete(`/project/delete/${projectId}`, { withCredentials: true });
      if(response.data.success){
        toast.success('Project deleted successfully!');
        await getProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  }

  useEffect(()=>{
    getProjects();
  },[])

    
    if(loading) return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-8 border-gray-200 border-t-blue-500"></div>
        </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Projects</h1>
            <p className="text-gray-600 text-lg">Manage and create your projects with ease</p>
          </div>

          {/* Create Project Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <div 
              onClick={()=>setIsModalOpen(!isModelOpen)} 
              className="group bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
                <i className="ri-add-large-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                Create New Project
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Start building something amazing
              </p>
            </div>
          </div>

          {/* Existing Projects Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project._id || project.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                    <div onClick={()=> navigate('/project' , {
                        state:project,
                      })} className="w-12 h-12 cursor-pointer bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="ri-folder-line text-purple-600 text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{project.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {project.users.length ? `${project.users.length} collaborators` : '0 collaborators'}
                    </p>
                    <p className="text-gray-400 text-xs mb-4">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project._id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-folder-open-line text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No projects found</h3>
                  <p className="text-gray-400">Create your first project to get started</p>
                </div>
              )}
            </div>
          </div>
          {isModelOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <i className="ri-close-line text-xl text-gray-500"></i>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      onChange={(e)=>setFormName(e.target.value)}
                      value={formName}
                      type="text"
                      id="projectName"
                      className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                      placeholder="Enter your project name"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200 font-medium text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formName.trim()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition duration-200 font-medium"
                    >
                      Create Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Project Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Project</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <i className="ri-close-line text-xl text-gray-500"></i>
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      onChange={(e)=>setEditFormName(e.target.value)}
                      value={editFormName}
                      type="text"
                      id="editProjectName"
                      className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                      placeholder="Enter new project name"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200 font-medium text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!editFormName.trim()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition duration-200 font-medium"
                    >
                      Update Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
    </div>
  )
}

export default Home