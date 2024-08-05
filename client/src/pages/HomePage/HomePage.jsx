import React from 'react';
import styles from './HomePage.module.css';

const HomePage = () => {
	return (
		<div className={styles.homeContainer}>
			<div className={styles.heroSection}>
				<h1 className={styles.title}>Welcome to Vibestream!</h1>
				<p className={styles.subtitle}>
					Your ultimate destination for music and visualizations.
				</p>
			</div>
		</div>
	);
};

export default HomePage;
