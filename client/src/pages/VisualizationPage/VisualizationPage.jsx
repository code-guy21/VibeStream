import React, { useState } from 'react';
import CrystalOrbVisualization from '../../components/CrystalOrbVisualization';
import WaveformVisualization from '../../components/WaveFormVisualization';
import styles from './VisualizationPage.module.css';

const VisualizationPage = () => {
	const [selectedTab, setSelectedTab] = useState('crystalOrb');
	const [isFullScreen, setIsFullScreen] = useState(false);

	const toggleFullScreen = () => {
		setIsFullScreen(!isFullScreen);
	};

	return (
		<div
			className={`${styles.visualizationPage} ${
				isFullScreen ? styles.fullScreen : ''
			}`}>
			<div className={styles.tabContainer}>
				<button
					className={`${styles.tabButton} ${
						selectedTab === 'crystalOrb' ? styles.activeTab : ''
					}`}
					onClick={() => setSelectedTab('crystalOrb')}>
					Crystal Orb
				</button>
				<button
					className={`${styles.tabButton} ${
						selectedTab === 'waveform' ? styles.activeTab : ''
					}`}
					onClick={() => setSelectedTab('waveform')}>
					Waveform
				</button>
			</div>
			<div className={styles.visualizationContainer}>
				{selectedTab === 'crystalOrb' && <CrystalOrbVisualization />}
				{selectedTab === 'waveform' && <WaveformVisualization />}
			</div>
			{/* Exit Full Screen Button */}
			<button className={styles.exitButton} onClick={toggleFullScreen}>
				{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
			</button>
		</div>
	);
};

export default VisualizationPage;
