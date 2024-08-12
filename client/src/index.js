import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import Auth from './containers/Auth';
import PlayBack from './pages/Playback';
import ServicePage from './pages/ServicePage';
import VisualizationPage from './pages/VisualizationPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import VerifyInstructionPage from './pages/VerifyInstructionPage';
import VerifyStatusPage from './pages/VerifyStatusPage';
import './index.css';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';

import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/app',
		element: <App />,
		children: [
			{
				path: '/app/',
				element: <ProtectedRoute element={<HomePage />}></ProtectedRoute>,
			},
			{
				path: '/app/login',
				element: <Auth />,
			},
			{
				path: '/app/playback',
				element: <ProtectedRoute element={<PlayBack />}></ProtectedRoute>,
			},
			{
				path: '/app/service',
				element: <ProtectedRoute element={<ServicePage />}></ProtectedRoute>,
			},
			{
				path: '/app/verify-instruction',
				element: <VerifyInstructionPage />,
			},
			{
				path: '/app/verify',
				element: <VerifyStatusPage />,
			},
			{
				path: '/app/visual',
				element: (
					<ProtectedRoute element={<VisualizationPage />}></ProtectedRoute>
				),
			},
			{
				path: '/app/register',
				element: <RegisterPage />,
			},
		],
	},
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<RouterProvider router={router}></RouterProvider>
		</Provider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
