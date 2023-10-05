# VibeStream - Technical Architecture (Phase 1)

_Version: 1.0.1_  
_Date: 10/04/2023_  
_Author: Alexis San Javier_

---

## Introduction

This document outlines the technical decisions made for the Phase 1 deployment of the VibeStream application. Its purpose is to guide development efforts, provide clarity on the tech stack, and ensure alignment with project requirements.

---

## Front-End

### Core

- **Framework**: React
  - **Rationale**: Industry-standard, component-based framework for building scalable and maintainable UIs.

### User Management

- **Account Registration**: Custom module integrated with Spotify OAuth.
- **Profile Customization**: Allows user avatars, background images, and bio.

### Music Features

- **Song Search**: Integration with Spotify API.
- **Audio Playback Menu**: Custom module for play, pause, next, and previous functionality.
- **Spotify Playlist Management**: Users can pull and modify their playlists.

### Visualizations

- **AI-powered Visualizations**: Generated using feedback from the IBM Watson API.
- **Visualization Rating System**: Custom module for users to provide feedback.
- **Visualization Saving**: Users can save their favorite visualizations.

### UI/UX

- **Lyrics Toggle**: Option to display song lyrics.
- **Cover Art Toggle**: Option to show or hide the song's cover art.
- **Minimized Player Window**: Allow users to minimize the currently playing song.
- **Visualization Sharing**: Users can share their visualizations on social platforms.
- **User Search & Engagement**: Browse and interact with other users' profiles and visualizations.

---

## Back-End

### Core

- **Server**: Node.js with Express.js
  - **Rationale**: Efficient and scalable server solution for web applications.

### Authentication & Authorization

- **Spotify OAuth Integration**: For user registration and song data retrieval.

### Data Management

- **Database**: MongoDB
  - **Rationale**: Flexible NoSQL database ideal for user data, playlist storage, and visualization preferences.

### AI Integration

- **IBM Watson SDK**: AI-driven visualization suggestions based on user feedback and song analysis.

---

## Deployment

### Containerization

- **Tool**: Docker
  - **Rationale**: Provides consistent environments and facilitates scalability and orchestration.

### Hosting & Infrastructure

- **Platform**: AWS
- **Storage**: S3 for application assets.
- **NoSQL Database**: DocumentDB for user data and visualization details.
- **Virtual Server**: EC2 for running the main application.

---

## Future Considerations

The architecture is designed to be modular and scalable to allow for the addition of features in subsequent phases. Future enhancements may include VR visualizations, social features like following/followers, and additional integrations with other music streaming platforms.

---

## Conclusion

This document serves as a roadmap for the development of VibeStream's Phase 1. All tech decisions have been made to align with the project's requirements, ensuring a seamless and engaging user experience.

---
