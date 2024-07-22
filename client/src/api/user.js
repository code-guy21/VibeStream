export const login = formData => {
	return fetch('/api/auth/login', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(formData),
	});
};

export const logout = () => {
	return fetch('/api/auth/logout', {
		method: 'POST',
	});
};

export const getAuthStatus = () => {
	return fetch('/api/auth/check');
};
