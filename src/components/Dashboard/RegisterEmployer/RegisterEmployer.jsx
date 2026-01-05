import styles from "./RegisterEmplyer.module.scss";
import FirstTab from "./FirstTab/FirstTab";

const RegisterEmployer = ({ setNavigation }) => {
    return (
        <div className={styles.registerContainer}>
            <FirstTab setNavigation={setNavigation} />
        </div>
    )
}

export default RegisterEmployer;
