import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/AxiosInstance";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading, setUser } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
      toast("loggedOut Successfull");
      navigate("/login");
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="flex fixed w-full z-50 justify-between max-h-16 items-center p-4 bg-sky-400 shadow-md">
      <div className="navbar-left">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
        >
          Home
        </button>
      </div>
      {!user && !loading ? (
        <div className="navbar-right space-x-2">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Register
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 ">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <img
              className="h-4 w-4 rounded-2xl"
              src={`/api/avatar/${user?.user?.email}`}
              alt="avatar"
            />
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
