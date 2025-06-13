<<<<<<< HEAD
# EcoGlow - Waste Management Application

## Overview
EcoGlow is a waste management application that helps users identify recyclable items and provides information on composting and skincare uses for food waste.

## Project Structure
- **Frontend**: HTML, CSS, and JavaScript for the user interface
- **Backend**: Node.js Express server with Google Vision API for image recognition

## Local Development

### Prerequisites
- Node.js and npm installed
- Google Cloud Vision API credentials
- Groq API key

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   PORT=3000
   JWT_SECRET=your_jwt_secret
   
   # Google Cloud Vision Credentials
   GOOGLE_PROJECT_ID=your_project_id
   GOOGLE_PRIVATE_KEY_ID=your_private_key_id
   GOOGLE_PRIVATE_KEY="your_private_key_with_newlines_as_\n"
   GOOGLE_CLIENT_EMAIL=your_client_email
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
   GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   GOOGLE_CLIENT_X509_CERT_URL=your_client_cert_url
   GOOGLE_UNIVERSE_DOMAIN=googleapis.com
   ```
4. Start the backend server:
   ```
   cd backend
   npm start
   ```
6. Open the frontend in a browser (using a local server or directly opening the HTML files)

## Deploying to Vercel

### Backend Deployment

1. Push your code to a GitHub repository
2. Create a new project in Vercel and link it to your GitHub repository
3. Configure the following environment variables in Vercel:
   - `GROQ_API_KEY`: Your Groq API key
   - `JWT_SECRET`: A secure secret for JWT token generation
   - `GOOGLE_PROJECT_ID`: Your Google Cloud project ID
   - `GOOGLE_PRIVATE_KEY_ID`: Your Google Cloud private key ID
   - `GOOGLE_PRIVATE_KEY`: Your Google Cloud private key (make sure to replace newlines with \n)
   - `GOOGLE_CLIENT_EMAIL`: Your Google Cloud client email
   - `GOOGLE_CLIENT_ID`: Your Google Cloud client ID
   - `GOOGLE_AUTH_URI`: Google auth URI (usually https://accounts.google.com/o/oauth2/auth)
   - `GOOGLE_TOKEN_URI`: Google token URI (usually https://oauth2.googleapis.com/token)
   - `GOOGLE_AUTH_PROVIDER_X509_CERT_URL`: Google auth provider cert URL
   - `GOOGLE_CLIENT_X509_CERT_URL`: Google client cert URL
   - `GOOGLE_UNIVERSE_DOMAIN`: Google universe domain (usually googleapis.com)
4. Deploy the backend by selecting the backend directory as the root directory

### Frontend Deployment

1. Create a new project in Vercel for the frontend
2. Configure the following environment variable in Vercel:
   - `API_URL`: The URL of your deployed backend (e.g., https://your-backend-url.vercel.app)
3. Deploy the frontend by selecting the frontend directory as the root directory

## Important Notes for Deployment

- The application is configured to automatically detect whether it's running in development or production mode
- In development mode, it uses local credentials and fallback values
- In production mode, it uses environment variables set in Vercel
- Make sure to properly format the `GOOGLE_PRIVATE_KEY` environment variable, replacing newlines with \n
## Security Considerations

- Never commit sensitive credentials to your repository
- Use environment variables for all sensitive information
- Ensure your JWT secret is strong and unique# sample-ecoglow
=======
# final-ecoglow
>>>>>>> 6f4dd2d29a2d91156691f4cb798435ef57d48aa9
# sample-ecoglow
