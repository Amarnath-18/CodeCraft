import React, { useState } from "react";
import { getAvatarUrl } from "../utils/projectUtils";

const ProjectSidebar = ({
  isOpen,
  onClose,
  currentProject,
  onAddUser,
  onRemoveUser,
}) => {
  const [userEmail, setUserEmail] = useState("");

  const handleAddUser = () => {
    if (!userEmail.trim()) return;
    onAddUser({ userEmail: userEmail.trim(), projectId: currentProject._id });
    setUserEmail("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddUser();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarHeader onClose={onClose} />
        <SidebarContent
          currentProject={currentProject}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          onAddUser={handleAddUser}
          onRemoveUser={onRemoveUser}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
    </>
  );
};

const SidebarHeader = ({ onClose }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="ri-team-line text-lg text-gray-700"></i>
          <h2 className="text-lg font-semibold text-gray-800">
            Project Members
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <i className="ri-close-line text-gray-600"></i>
        </button>
      </div>
    </div>
  );
};

const SidebarContent = ({
  currentProject,
  userEmail,
  setUserEmail,
  onAddUser,
  onRemoveUser,
  onKeyDown,
}) => {
  return (
    <div className="p-4">
      {/* Add Member Section */}
      <AddMemberSection
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        onAddUser={onAddUser}
        onKeyDown={onKeyDown}
      />

      {/* Members List */}
      <MembersList
        members={currentProject.users}
        onRemoveUser={onRemoveUser}
      />
    </div>
  );
};

const AddMemberSection = ({ userEmail, setUserEmail, onAddUser, onKeyDown }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <i className="ri-user-add-line"></i>
        Add Member
      </h3>
      <div className="flex gap-2">
        <input
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          onKeyDown={onKeyDown}
          type="email"
          placeholder="Enter email address"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={onAddUser}
          disabled={!userEmail.trim()}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            userEmail.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <i className="ri-add-line mr-1"></i>
          Add
        </button>
      </div>
    </div>
  );
};

const MembersList = ({ members, onRemoveUser }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <i className="ri-group-line"></i>
        Members ({members.length})
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {members.map((user) => (
          <MemberCard
            key={user.user._id}
            user={user}
            onRemoveUser={onRemoveUser}
          />
        ))}
      </div>
    </div>
  );
};

const MemberCard = ({ user, onRemoveUser }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
        <img
          className="w-full h-full rounded-full object-cover"
          src={getAvatarUrl(user?.user?.email)}
          alt="avatar"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center" style={{display: 'none'}}>
          {user?.user?.email?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">
          {user.user?.email}
        </p>
        <p className="text-xs text-blue-600 capitalize">{user?.role}</p>
      </div>
      <button
        onClick={() => onRemoveUser(user.user._id)}
        className="p-2 hover:bg-red-100 rounded-full transition-colors group"
        title="Remove user"
      >
        <i className="ri-user-unfollow-line text-red-500 group-hover:text-red-600"></i>
      </button>
    </div>
  );
};

export default ProjectSidebar;
