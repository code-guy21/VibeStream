import React from 'react';
import styles from './VisualizationSwitcher.module.css';

const VisualizationSwitcher = ({ currentVisualization, setVisualization }) => {
	return (
		<div className={styles.tabContainer}>
			<button
				className={`${styles.tabButton} ${
					currentVisualization === 'crystal' ? styles.activeTab : ''
				}`}
				onClick={() => setVisualization('crystal')}>
				Crystal Orb
			</button>
			<button
				className={`${styles.tabButton} ${
					currentVisualization === 'waveform' ? styles.activeTab : ''
				}`}
				onClick={() => setVisualization('waveform')}>
				Waveform
			</button>
		</div>
	);
};

export default VisualizationSwitcher;
