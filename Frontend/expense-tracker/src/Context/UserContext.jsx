import React, { useState, createContext } from "react";

export const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState(null)

    // function to update user data
    const updateUser = (userData) => {
        setUser(userData);
    }

    //function to clear userdata
    const clearUser = () => {
        setUser(null);
    }
    return (
        <UserContext.Provider
            value={{
                user, 
                updateUser, 
                clearUser
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;