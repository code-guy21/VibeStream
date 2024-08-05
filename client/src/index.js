import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import Auth from './containers/Auth';
import PlayBack from './pages/Playback';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import VisualizationPage from './pages/VisualizationPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './index.css';

import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <ProtectedRoute element={<HomePage />}></ProtectedRoute>,
			},
			{
				path: '/login',
				element: <Auth />,
			},
			{
				path: '/playback',
				element: <ProtectedRoute element={<PlayBack />}></ProtectedRoute>,
			},
			{
				path: '/service',
				element: <ProtectedRoute element={<ServicePage />}></ProtectedRoute>,
			},
			{
				path: '/visual',
				element: (
					<ProtectedRoute element={<VisualizationPage />}></ProtectedRoute>
				),
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
