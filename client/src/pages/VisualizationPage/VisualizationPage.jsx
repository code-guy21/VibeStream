import React, { useState } from 'react';
import CrystalOrbVisualization from '../../components/CrystalOrbVisualization';
import WaveformVisualization from '../../components/WaveFormVisualization';
import styles from './VisualizationPage.module.css';

const VisualizationPage = () => {
	const [selectedTab, setSelectedTab] = useState('crystalOrb');

	return (
		<div className={styles.visualizationPage}>
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
		</div>
	);
};

export default VisualizationPage;
