import { useState } from 'react';

function Login() {
	const [form, setForm] = useState({
		email: '',
		password: '',
	});
	async function submitHandler(e) {
		e.preventDefault();

		try {
			let res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify(form),
			});

			let data = await res.json();

			console.log(data);
		} catch (error) {
			console.log(error);
		}
	}

	function onChangeHandler(e) {
		if (e.target.name === 'email') {
			setForm({
				...form,
				email: e.target.value,
			});
		} else if (e.target.name === 'password') {
			setForm({
				...form,
				password: e.target.value,
			});
		}
	}

	return (
		<div>
			<form onSubmit={submitHandler}>
				<label>email</label>
				<input
					name='email'
					onChange={onChangeHandler}
					id='email'
					type='email'
				/>
				<label>password</label>
				<input
					name='password'
					onChange={onChangeHandler}
					id='password'
					type='password'
				/>
				<button>submit</button>
			</form>
		</div>
	);
}

export default Login;
