import React from 'react';
import styles from './VisualizationSwitcher.module.css';

const VisualizationSwitcher = ({
	currentVisualization,
	setVisualization,
	isFullScreen,
	toggleFullScreen,
}) => {
	return (
		<div className={styles.switcher}>
			<button
				className={currentVisualization === 'crystal' ? styles.active : ''}
				onClick={() => setVisualization('crystal')}>
				Crystal Orb
			</button>
			<button
				className={currentVisualization === 'waveform' ? styles.active : ''}
				onClick={() => setVisualization('waveform')}>
				Waveform
			</button>
			<button
				className={`${styles.fullScreenButton} ${
					isFullScreen ? styles.active : ''
				}`}
				onClick={toggleFullScreen}>
				{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
			</button>
		</div>
	);
};

export default VisualizationSwitcher;
