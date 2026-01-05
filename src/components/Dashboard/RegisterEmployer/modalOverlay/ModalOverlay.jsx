 import { industryOptions } from '../../../../constants/industryOptions';
import Button from '../../../common/Button/Button';
import styles from './ModalOverlay.module.scss';

const ModalOverlay = ({
    organizationDetails, 
    showConfirmOverlay,
    setShowConfirmOverlay,
    setVerified
    }) => {


    return(
        <>
            {/* Overlay to confirm organization details */}
            {showConfirmOverlay && organizationDetails && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <h2>Confirm Organisation Details</h2>
                        <h3>Trading Name: {organizationDetails.tradingName}</h3>
                        <p><strong>Ownership Type:</strong> {organizationDetails.ownershipType}</p>
                        <div className={styles.orgDetails}>

                            <div className={styles.sectionsContainer}>
                                <div className={styles.sectionsContainerSection}>
                                    <h4>Address</h4>
                                    <h6>
                                        {organizationDetails.address?.street?.number} {organizationDetails.address?.street?.name}<br/>
                                        {organizationDetails.address?.street?.suburb}<br/>
                                        {organizationDetails.address?.street?.city}<br/>
                                        {organizationDetails.address?.street?.province}<br/>
                                        {organizationDetails.address?.street?.postalCode}
                                    </h6>
                                </div>
                                <div className={styles.sectionsContainerSection}>
                                    <h4>Postal Address</h4>
                                    <h6>
                                        {organizationDetails.address?.street?.number} {organizationDetails.address?.street?.name}<br/>
                                        {organizationDetails.address?.street?.suburb}<br/>
                                        {organizationDetails.address?.street?.city}<br/>
                                        {organizationDetails.address?.street?.province}<br/>
                                        {organizationDetails.address?.street?.postalCode}
                                    </h6>
                                </div>
                                <div className={styles.sectionsContainerSection}>
                                    <h4>Contact</h4>
                                    <h6>
                                        <div>
                                            <span>Person:</span> <p>{organizationDetails.contact?.person}</p>
                                        </div>
                                        <div>
                                            <span>Telephone:</span> <p>{organizationDetails.contact?.telephone}</p>
                                        </div>
                                        <div>
                                            <span>Cellphone:</span> <p>{organizationDetails.contact?.cellphone}</p>
                                        </div>
                                        <div>
                                            <span>Email:</span> <p>{organizationDetails.contact?.email}</p>
                                        </div>

                                    </h6>
                                
                                </div>
                                <div className={styles.sectionsContainerSection}>
                                    <h4>Banking</h4>
                                    <h6>
                                        <div>
                                            <span>Bank Name:</span> <p>{organizationDetails.banking?.bankName}</p>
                                        </div>
                                        <div>
                                            <span>Account Holder:</span> <p>{organizationDetails.banking?.accountHolder}</p>
                                        </div>
                                        <div>
                                            <span>Account Number:</span> <p>{organizationDetails.banking?.accountNumber}</p>
                                        </div>
                                        <div>
                                            <span>Branch Code:</span> <p>{organizationDetails.banking?.branchCode}</p>
                                        </div>
                                    </h6>
                                
                                </div>
                                <div className={styles.sectionsContainerSection}>
                                    <h4>Business Info</h4>
                                    <h6>
                                        <div>
                                            <span>Number of Employees:</span> <p>{organizationDetails.businessInfo?.numberOfEmployees}</p>
                                        </div>
                                        <div>
                                            <span>Industries:</span> <p>{industryOptions[organizationDetails.businessInfo?.industries?.join(', ')]}</p>
                                        </div>
                                    </h6>
                                    <h4>First Employee Date</h4>
                                    <h6>{new Date(organizationDetails.firstEmployeeDate).toLocaleDateString()}</h6>
                                </div>                            
                            </div>
                        </div>
                        <div className={styles.overlayButtons}>
                            <Button variant="secondary" onClick={() => { setVerified(true); setShowConfirmOverlay(false); }}>
                                Confirm
                            </Button>
                            <Button variant="primary" onClick={() => setShowConfirmOverlay(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ModalOverlay;