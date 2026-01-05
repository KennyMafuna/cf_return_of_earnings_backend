import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navigation.module.scss";
import { useAuth } from "../../../contexts/AuthContext";

const Navigation = () => {
    const navigate = useNavigate();
    const {user, setUser} = useAuth();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/signin');
    };
    
    return (
        <div className={styles.navigationContainer}>
                {!user ?
                    <nav>
                        <NavLink
                            to={"/signin"}
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                        }
                        >
                            Home
                        </NavLink>
                        {/* <NavLink
                            to="https://compeasy.labour.gov.za/fiori"
                            target="_blank"
                            className={styles.navItem}
                        >
                            Register a Claim
                        </NavLink> */}
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                            }
                        >
                            Register
                        </NavLink>
                        <NavLink
                            to={"/manual"}
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                            }
                        >
                            Manual
                        </NavLink>
                    </nav>
                    :
                    <nav>
                        <NavLink
                            to={"/"}
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                        }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="https://compeasy.labour.gov.za/fiori"
                            target="_blank"
                            className={styles.navItem}
                        >
                            Register a Claim
                        </NavLink>
                        <NavLink
                            to={"/password-change"}
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                            }
                        >
                            Change Password
                        </NavLink>
                        {user &&
                            <a onClick={handleLogout} className={`${styles.navItem} ${styles.logout}`}>
                                Logout
                            </a>
                        }
                    </nav>
                }
        </div>
    )
}

export default Navigation;