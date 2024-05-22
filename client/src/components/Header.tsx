import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import GoogleAuth from "./GoogleAuth";

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <header>
      <nav className="header-nav">
        <div className="nav-left">
          <h1>gshub</h1>
        </div>
        <div className="nav-right">
          {isAuthenticated && user ? (
            <div className="user-info">
              <img src={user.picture} alt="Profile Picture" />
              <span>{user.name}</span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <GoogleAuth />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
