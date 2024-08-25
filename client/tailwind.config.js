/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				heading: ['Inter', 'sans-serif'],
				body: ['Open Sans', 'sans-serif'],
			},
			colors: {
				primary: '#1e1e1e', // Example primary color
				accent: '#ff6b6b', // Example accent color
			},
		},
		animation: {
			'fade-in': 'fadeIn 2s ease-out forwards',
		},
		keyframes: {
			fadeIn: {
				'0%': { opacity: 0, transform: 'translateY(20px)' },
				'100%': { opacity: 1, transform: 'translateY(0)' },
			},
		},
		transitionDelay: {
			500: '500ms',
			700: '700ms',
			900: '900ms',
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
