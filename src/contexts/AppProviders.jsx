import { AuthProvider } from "./AuthContext";
import { ErrorProvider } from "./ErrorContext";
import { LoadingProvider } from "./LoadingContext";
import { OrganisationProvider } from "./OrganisationContext";
import GlobalError from "../components/layout/GlobalError/GlobalError";
import LoadingComponent from "../components/layout/LoadingComponent/LoadingComponent";

export function AppProviders ({ children }) {
    return (
        <ErrorProvider>
            <LoadingProvider>
                <AuthProvider>
                    <OrganisationProvider>
                        <GlobalError />
                        <LoadingComponent />
                        {children}
                    </OrganisationProvider>
                </AuthProvider>
            </LoadingProvider>
        </ErrorProvider>
    )
}