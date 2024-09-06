import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';
import styles from './LandingPage.module.css';

function LandingPage() {
	const featuresRef = useRef(null);
	const aboutRef = useRef(null);
	const ctaRef = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add(styles.visible);
					}
				});
			},
			{ threshold: 0.1 }
		);

		if (featuresRef.current) observer.observe(featuresRef.current);
		if (aboutRef.current) observer.observe(aboutRef.current);
		if (ctaRef.current) observer.observe(ctaRef.current);

		return () => {
			if (featuresRef.current) observer.unobserve(featuresRef.current);
			if (aboutRef.current) observer.unobserve(aboutRef.current);
			if (ctaRef.current) observer.unobserve(ctaRef.current);
		};
	}, []);

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

				<section className={styles.features} ref={featuresRef}>
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

				<section className={styles.about} ref={aboutRef}>
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

				<section className={styles.cta} ref={ctaRef}>
					<h2>Ready to elevate your music experience?</h2>
					<Link to='/app' className={styles.ctaButton}>
						Launch VibeStream
					</Link>
				</section>
			</main>

			<footer className={styles.footer}>
				<p>&copy; 2024 VibeStream. All rights reserved.</p>
				<nav>
					<a href='#' className={styles.footerLink}>
						Privacy Policy
					</a>
					<a href='#' className={styles.footerLink}>
						Terms of Service
					</a>
				</nav>
			</footer>
		</div>
	);
}

export default LandingPage;
