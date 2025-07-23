import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/AxiosInstance';
import { UserContext } from '../context/user.context';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const Login = () => {
  const [formdata , setFormdata] = useState({
    email:"",
    password:"",
  });
  const navigate = useNavigate();
  const { setUser} = useContext(UserContext);

  const handleForm = (e)=>{
    const {name , value} = e.target;
    setFormdata((prev)=>({
      ...prev,
      [name]:value,
    }));
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/user/login', formdata);
      if(response.data.success == true){
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        setUser(response.data.user);
        navigate('/');
        toast.success("Welcome..");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Login to your account
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                onChange={handleForm}
                id="email"
                name="email"
                type="email"
                value={formdata.email}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                onChange={handleForm}
                id="password"
                name="password"
                type="password"
                value={formdata.password}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
