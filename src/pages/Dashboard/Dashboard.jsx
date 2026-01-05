import { useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import Navigation from "../../components/layout/Navigation/Navigation";
import departmentLogo from "../../assets/images/dapartmentLogo.png";
import whiteLogo from "../../assets/images/white-logo.png";
import RegisterEmployer from "../../components/Dashboard/RegisterEmployer/RegisterEmployer";
import LinkOrganisation from "../../components/Dashboard/LinkOrganisation/LinkOrganisation";
import SelectOrganisation from "../../components/Dashboard/SelectOrganisation/SelectOrganisation";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [navigation, setNavigation] = useState('select');
    const [hideTop, setHideTop] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleChangeNavigation = (tab) => {
        setNavigation(tab);
    }; 

    const renderTabContent = () => {
        if (navigation === 'select') {
            return (
                <div className={styles.tabContent}>
                    <h2>Select Organisation</h2>
                    <p>Choose from your existing organisations...</p>
                    <SelectOrganisation setNavigation={setNavigation}/>
                </div>
            );
        } else if (navigation === 'link') {
            return (
                <div className={styles.tabContent}>
                    <h2>Link Organisation</h2>
                    <p>Link a new organisation to your account...</p>
                    <LinkOrganisation setNavigation={setNavigation}/>
                </div>
            );
        } else if (navigation === 'register') {
            return (
                <div className={styles.tabContent}>
                    <h2>CAPTURE NEW ORGANISATION</h2>
                    <p>Register Organisation</p>
                    <RegisterEmployer setNavigation={setNavigation}/>
                </div>
            );
        }
    };

    if (!user) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={hideTop ? styles.hideContent : styles.content}>
                { !hideTop  &&
                    <>
                        <header className={styles.header}>
                            <img src={whiteLogo} alt="" />
                            <div className={styles.navigationContainer}>
                                <h1>Online Submissions Home</h1>
                                <Navigation/>
                            </div>
                            <img src={departmentLogo} alt="" />
                        </header>
                        <div className={styles.welcomeContainer}>
                            <div className={styles.welcomeCard}>
                                <h2>Welcome to the Department of Labour: Compensation Fund Online Submission Portal</h2>
                            </div>
                            
                            <div className={styles.actions}>
                                <a 
                                    className={`${styles.actionItem} ${navigation === 'select' ? styles.active : ''}`}
                                    onClick={() => handleChangeNavigation("select")}
                                >
                                    Select Organisation
                                </a>
                                <a 
                                    className={`${styles.actionItem} ${navigation === 'link' ? styles.active : ''}`}
                                    onClick={() => handleChangeNavigation("link")}
                                >
                                    Link Organisation
                                </a>
                                <a 
                                    className={`${styles.actionItem} ${navigation === 'register' ? styles.active : ''}`}
                                    onClick={() => handleChangeNavigation("register")}
                                >
                                    Register Employer
                                </a>
                            </div>
                        </div>
                    </>
                }
                
            </div>
            <div className={hideTop ? `${styles.bringTopTabContainer} ${styles.tabContainer}` : styles.tabContainer}>
                <a className={hideTop ? styles.bringTop : ""} onClick={() => setHideTop(!hideTop)}>
                    <i className="fa-solid fa-up-down"/>
                </a>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Dashboard;