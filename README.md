# Charging Station Management System

A full-stack application for managing EV charging stations.

## Environment Variables

The following environment variables are required:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5002
JWT_SECRET=your_jwt_secret
```

## Deployment

This application is configured for deployment on Render.com.

### Backend Service Configuration
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Set MONGODB_URI, PORT, and JWT_SECRET

### Frontend Static Site Configuration
- Build Command: `npm install && npm run build`
- Publish Directory: `build` 