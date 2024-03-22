import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './RootLayout';
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import RegistrationSuccessfulPage from './pages/RegistrationSuccessfulPage/RegistrationSuccessfulPage';
import LoginPage from './pages/LoginPage/LoginPage';
import UserPage from './pages/UserPage/UserPage';
import AccountPage from './pages/AccountPage/AccountPage';
import NotFoundPage from './pages/NotFoundPage/NotFound';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';

const router = createBrowserRouter([{
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "/:squadId?", element: <HomePage/> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/registration_successful", element: <RegistrationSuccessfulPage />},
            { path: "/user", element: <UserPage />},
            { path: "/account", element: <AccountPage />},
            { path: "/forgot_password", element: <ForgotPasswordPage />},
            { path: "/reset_password", element: <ResetPasswordPage />},
            { path: "*", element: <NotFoundPage />},
        ]
    }
]);

function App() {  
    return <RouterProvider router={router}/>;
}

export default App;
