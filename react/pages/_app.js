import "../styles/global.css";
import { UserProvider } from '../utils/UserContext/UserContext'
export default function MyApp({ Component, pageProps }) {
    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    );
    }

