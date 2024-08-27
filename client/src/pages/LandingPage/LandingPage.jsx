import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';
import styles from './LandingPage.module.css';

function LandingPage() {
	return (
		<div className={styles.landingPage}>
			<header className={styles.header}>
				<img src={logo} alt='VibeStream Logo' className={styles.logo} />
			</header>

			<main>
				<section className={styles.hero}>
					<h1>Welcome to VibeStream</h1>
					<p>Discover, visualize, and share your music like never before.</p>
					<Link to='/app' className={styles.ctaButton}>
						Launch App
					</Link>
				</section>

				<section className={styles.features}>
					<h2>Key Features</h2>
					<div className={styles.featureGrid}>
						{[
							{
								title: 'Immersive Visualizations',
								description:
									'Experience your music with stunning visual effects that react to the beat.',
							},
							{
								title: 'Spotify Integration',
								description:
									'Seamlessly connect your Spotify account and access your favorite tracks.',
							},
						].map((feature, index) => (
							<div key={index} className={styles.featureItem}>
								<h3>{feature.title}</h3>
								<p>{feature.description}</p>
							</div>
						))}
					</div>
				</section>

				<section className={styles.about}>
					<h2>About VibeStream</h2>
					<p>
						VibeStream is a music visualization platform that transforms your
						listening experience. It combines the power of music streaming with
						visual effects, creating an immersive environment for music lovers
						and visual enthusiasts alike.
					</p>
					<p>
						Born from a passion for music and technology, VibeStream aims to
						change how we interact with and experience our favorite tunes.
					</p>
				</section>

				<section className={styles.cta}>
					<h2>Ready to elevate your music experience?</h2>
					<Link to='/app' className={styles.ctaButton}>
						Launch VibeStream
					</Link>
				</section>
			</main>

			<footer className={styles.footer}>
				<p>&copy; 2024 VibeStream. All rights reserved.</p>
			</footer>
		</div>
	);
}

export default LandingPage;
