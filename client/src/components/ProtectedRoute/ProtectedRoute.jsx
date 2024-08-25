import { React } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ element }) {
	const { loading, loggedIn } = useSelector(state => state.user);

	if (loading) {
		return null;
	}

	return loggedIn ? element : <Navigate to='/app/login'></Navigate>;
}

export default ProtectedRoute;
