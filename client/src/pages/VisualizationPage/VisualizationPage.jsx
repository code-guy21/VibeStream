import React, { useEffect, useRef } from 'react';
import {
	FreeCamera,
	Vector3,
	HemisphericLight,
	MeshBuilder,
	Animation,
} from '@babylonjs/core';
import { useSelector } from 'react-redux';
import SceneComponent from '../../components/SceneComponent';

let sphere;
let bounceAnimation;

const VisualizationPage = () => {
	const { audioAnalysis, isPaused, trackState } = useSelector(
		state => state.playback
	);
	const animationRef = useRef(null);
	const timeoutRef = useRef(null);
	const beatIndexRef = useRef(0);

	const onSceneReady = scene => {
		const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
		camera.setTarget(Vector3.Zero());

		const canvas = scene.getEngine().getRenderingCanvas();
		camera.attachControl(canvas, true);

		const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
		light.intensity = 0.7;

		sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
		sphere.position.y = 1;

		MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);

		bounceAnimation = new Animation(
			'sphereBounce',
			'position.y',
			60, // frames per second
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE
		);

		const keys = [
			{ frame: 0, value: 1 },
			{ frame: 15, value: 3 },
			{ frame: 30, value: 1 },
		];

		bounceAnimation.setKeys(keys);
		sphere.animations.push(bounceAnimation);

		animationRef.current = bounceAnimation;
	};

	const scheduleNextBounce = beatTimes => {
		if (beatIndexRef.current >= beatTimes.length) return;

		const nextBounceTime = beatTimes[beatIndexRef.current];
		const now = performance.now();
		const delay = nextBounceTime - now;

		if (delay > 0) {
			timeoutRef.current = setTimeout(() => {
				if (animationRef.current && !isPaused) {
					sphere.getScene().beginAnimation(sphere, 0, 30, false);
				}
				beatIndexRef.current++;
				scheduleNextBounce(beatTimes);
			}, delay);
		} else {
			beatIndexRef.current++;
			scheduleNextBounce(beatTimes);
		}
	};

	useEffect(() => {
		if (animationRef.current && audioAnalysis?.beats?.length > 0) {
			clearTimeout(timeoutRef.current);

			const currentTime = trackState.position || 0;
			const beatTimes = audioAnalysis.beats.map(
				beat => performance.now() + beat.start * 1000 - currentTime
			);
			beatIndexRef.current = audioAnalysis.beats.findIndex(
				beat => beat.start * 1000 > currentTime
			);

			scheduleNextBounce(beatTimes);
		}
	}, [audioAnalysis]);

	useEffect(() => {
		if (animationRef.current) {
			if (isPaused) {
				clearTimeout(timeoutRef.current);
				sphere.getScene().stopAnimation(sphere);
			} else {
				const currentTime = trackState.position || 0;
				const beatTimes = audioAnalysis.beats.map(
					beat => performance.now() + beat.start * 1000 - currentTime
				);
				beatIndexRef.current = audioAnalysis.beats.findIndex(
					beat => beat.start * 1000 > currentTime
				);

				scheduleNextBounce(beatTimes);
			}
		}
	}, [isPaused]);

	useEffect(() => {
		return () => {
			clearTimeout(timeoutRef.current);
		};
	}, []);

	return (
		<SceneComponent antialias onSceneReady={onSceneReady} id='my-canvas' />
	);
};

export default VisualizationPage;
