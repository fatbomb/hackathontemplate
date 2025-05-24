/**
 * Global TypeScript Declarations
 * Place global types, interfaces, and module declarations here.
 */
import { Credentials} from 'google-auth-library';

export { };

declare global {
    // Example: declare a global variable
    // var myGlobalVar: string;
    interface GoogleServiceAccount extends Credentials {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
        universe_domain?: string; // Optional as it may not be present in all configurations
    }
    // Example: extend the Window interface
    // interface Window {
    //   myCustomProperty: number;
    // }
}