# AI Prompt Manager

## Overview

AI Prompt Manager is a web-based application designed to help users organize, categorize, and manage AI prompts efficiently. The application provides a clean, intuitive interface for storing and retrieving prompts with a complete category management system featuring two-level hierarchy (categories and subcategories). Built as a single-page application using vanilla HTML, CSS, and JavaScript, it features a responsive design with mobile-friendly navigation, modern gradient-based UI, and comprehensive CRUD operations for category organization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript without any frontend frameworks
- **Responsive Grid Layout**: Uses CSS Grid for main layout structure with defined areas for header, sidebar, and main content
- **Mobile-First Design**: Implements hamburger menu navigation for mobile devices with overlay functionality
- **Component-Based Structure**: Organizes functionality into logical components (mobile menu, category navigation, search)

### UI/UX Design Patterns
- **Sidebar Navigation**: Fixed sidebar with hierarchical category tree structure
- **Modern Gradient Design**: Purple gradient header styling for visual appeal
- **Mobile Overlay Pattern**: Mobile navigation uses overlay approach for better UX on small screens
- **Two-Level Category Hierarchy**: Categories contain subcategories with expand/collapse functionality
- **Interactive Tree Structure**: Nested categories with animated expand/collapse icons and hover-reveal action buttons
- **Modal-Based Forms**: Professional modal dialogs for adding and editing categories and subcategories
- **Confirmation Dialogs**: Safe deletion with user confirmation to prevent accidental data loss

### JavaScript Architecture
- **Event-Driven Programming**: Uses DOM event listeners for user interactions
- **Modular Function Structure**: Code organized into initialization functions for different features
- **Responsive Event Handling**: Includes window resize event handling for adaptive behavior
- **CategoryManager Class**: Dedicated class for managing category data, CRUD operations, and localStorage persistence
- **Dynamic Tree Rendering**: Real-time category tree updates with expand/collapse state management
- **Form Management**: Modal-based forms with validation for category creation and editing

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
- **localStorage API**: For persistent category and subcategory data storage with automatic save/load functionality

### Development Dependencies
- No build tools or package managers currently implemented
- No external CSS frameworks or UI libraries
- No server-side dependencies or backend services

## Data Management

### Category Management Features
- **Two-Level Hierarchy**: Categories can contain multiple subcategories
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for both categories and subcategories
- **localStorage Persistence**: All category data automatically saved to browser storage
- **Default Categories**: Pre-populated with Writing, Coding, Business, Creative, and Analysis categories
- **Unique ID System**: Auto-generated unique identifiers for all categories and subcategories
- **State Management**: Expand/collapse states preserved across sessions
- **Data Validation**: Form validation and error handling for category operations

### Prompt Organization
- **Category-Based Filtering**: Prompts filtered by selected category or subcategory
- **Search Integration**: Search functionality works across the hierarchical structure
- **Sample Data**: Default prompts organized by category for demonstration purposes

**Note**: Current implementation uses localStorage for category persistence. Future iterations may include server-side storage for prompt data and user accounts.