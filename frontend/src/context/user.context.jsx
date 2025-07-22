import { createContext, useEffect, useState } from "react";
import axiosInstance from "../config/AxiosInstance";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [projects , setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function check() {
            try {
                const currUser = await axiosInstance.get('/user/me', { withCredentials: true });
                if (currUser && currUser.data) {
                    setUser(currUser.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []); // Only run once on mount
    return (
        <UserContext.Provider value={{projects , setProjects, user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext };
export default UserProvider;
