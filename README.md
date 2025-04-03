# Efficient Image Gallery

A responsive and performant image gallery with separate front-end and back-end components.

## Quick Start Guide

### Running Only the Frontend (No Backend Required)

If you just want to see the frontend in action without setting up the backend:

```bash
cd image-gallery/frontend
npm install
npm start
```

The app will automatically run with sample data if it cannot connect to the backend.

### Running Both Frontend and Backend

For full functionality (including image uploads and persistence):

#### 1. Start the Backend Server

```bash
cd image-gallery/backend
npm install
npm start
```

The backend will run on http://localhost:5000

#### 2. Start the Frontend

In a new terminal window:

```bash
cd image-gallery/frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

## Troubleshooting

### ESLint Warnings

ESLint warnings about unused variables can be safely ignored, as they don't affect functionality.

### Backend Connection Issues

If you see "Backend server is not available" messages, make sure:
1. The backend server is running
2. It's running on the expected port (5000)
3. There are no firewall or network issues blocking the connection

### Image Upload Issues

If you're having trouble uploading images with the backend running:
1. Check the backend console for error messages
2. Make sure the backend has appropriate permissions to write to the uploads directory
3. Verify the image size is under the 10MB limit

## Project Structure

### Frontend (`/frontend`)
- React.js application with TypeScript
- Responsive UI with Tailwind CSS
- Dynamic image gallery with filtering
- Image upload capability
- Works even without the backend (falls back to sample data)

### Backend (`/backend`)
- Express.js server
- API for image management
- File storage for uploaded images
- Image processing capabilities

## Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- react-masonry-css for the grid layout
- react-intersection-observer for lazy loading
- yet-another-react-lightbox for the lightbox functionality
- Axios for API communication

### Backend
- Node.js
- Express
- Multer for file uploads
- Sharp for image processing
- CORS for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd image-gallery/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Building for production

```bash
# Build the frontend
cd image-gallery/frontend
npm run build

# The backend can serve the frontend in production
cd ../backend
npm start
```

## API Endpoints

- `GET /api/images` - Get all images
- `GET /api/images/category/:category` - Get images by category
- `GET /api/images/:id` - Get a single image by ID
- `POST /api/images/upload` - Upload a new image
- `DELETE /api/images/:id` - Delete an image

## Customization

- Modify backend sample data in `backend/routes/images.js`
- Adjust styling in the frontend component files and/or tailwind.config.js
- Add more complex filtering by implementing additional filters 