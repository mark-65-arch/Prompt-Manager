# AI Prompt Manager

## Overview

AI Prompt Manager is a web-based application designed to help users organize, categorize, and manage AI prompts efficiently. The application provides a clean, intuitive interface for storing and retrieving prompts across different categories such as Writing, Coding, Business, Creative, and Analysis. Built as a single-page application using vanilla HTML, CSS, and JavaScript, it features a responsive design with mobile-friendly navigation and a modern gradient-based UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript without any frontend frameworks
- **Responsive Grid Layout**: Uses CSS Grid for main layout structure with defined areas for header, sidebar, and main content
- **Mobile-First Design**: Implements hamburger menu navigation for mobile devices with overlay functionality
- **Component-Based Structure**: Organizes functionality into logical components (mobile menu, category navigation, search)

### UI/UX Design Patterns
- **Sidebar Navigation**: Fixed sidebar with categorized prompt organization
- **Modern Gradient Design**: Purple gradient header styling for visual appeal
- **Mobile Overlay Pattern**: Mobile navigation uses overlay approach for better UX on small screens
- **Category-Based Organization**: Prompts are organized into predefined categories with ability to add custom categories

### JavaScript Architecture
- **Event-Driven Programming**: Uses DOM event listeners for user interactions
- **Modular Function Structure**: Code organized into initialization functions for different features
- **Responsive Event Handling**: Includes window resize event handling for adaptive behavior

### Styling Approach
- **CSS Reset**: Implements comprehensive reset for consistent cross-browser rendering
- **CSS Grid Layout**: Uses modern CSS Grid for responsive layout management
- **System Font Stack**: Utilizes native system fonts for optimal performance and consistency
- **Box-Shadow Effects**: Implements subtle shadows for depth and visual hierarchy

## External Dependencies

### Core Technologies
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Grid layout and gradient backgrounds
- **Vanilla JavaScript**: No external JavaScript frameworks or libraries

### Browser APIs
- **DOM API**: For element manipulation and event handling
- **Window API**: For responsive design and resize event handling

### Development Dependencies
- No build tools or package managers currently implemented
- No external CSS frameworks or UI libraries
- No server-side dependencies or backend services

**Note**: The current implementation appears to be frontend-only without persistence layer. Future iterations may require database integration for prompt storage and retrieval.