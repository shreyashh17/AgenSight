# InsightForge Deployment Guide

This guide provides step-by-step instructions to deploy the InsightForge multi-agent system. You can choose to self-host everything using Docker Compose, or deploy to cloud platforms like Vercel (Frontend) and Render (Backend).

## Option 1: Cloud Deployment (Vercel + Render)

This is the recommended approach for production, separating the frontend and backend for better scalability.

### Step 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and create a new **Blueprint Instance**.
2. Connect your GitHub repository containing this project.
3. Render will automatically detect the `render.yaml` file in the root directory.
4. Render will prompt you to provide values for the following environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API Key.
   - `TAVILY_API_KEY`: Your Tavily API Key.
   - `FRONTEND_URL`: Leave this blank for now (you will update it after deploying the frontend).
   - `JWT_SECRET_KEY`: A secure random string for JWT auth (generate one using `openssl rand -hex 32`).
5. Click **Apply** to start the deployment. 
6. Once deployed, note down the deployed backend URL (e.g., `https://insightforge-backend.onrender.com`).

*Note: The `render.yaml` is configured with a persistent disk so your SQLite database will not be lost between deployments.*

### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Expand the **Framework Preset**; Vercel will auto-detect Next.js.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Set this to your Render backend URL appended with `/api/v1` (e.g., `https://insightforge-backend.onrender.com/api/v1`).
6. Click **Deploy**.
7. Once deployed, note down the deployed Vercel frontend URL.

### Step 3: Update Backend CORS

1. Go back to your Render Dashboard.
2. Select your `insightforge-backend` web service.
3. Go to the **Environment** tab.
4. Update the `FRONTEND_URL` variable to your new Vercel URL (e.g., `https://insightforge-frontend.vercel.app`).
5. This will trigger a redeploy of the backend. Once finished, your frontend and backend will be fully connected!

---

## Option 2: Self-Hosting (Docker Compose)

If you prefer to host the entire application yourself on a single Virtual Machine (e.g., DigitalOcean Droplet, AWS EC2, or a local server), you can use the provided `docker-compose.yml`.

### Prerequisites
- Docker and Docker Compose installed on your server.
- The project code cloned to your server.

### Steps

1. **Set Environment Variables**
   Create a `.env` file in the root directory (you can copy `.env.example` if it exists) or directly export the variables:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   export TAVILY_API_KEY="your-tavily-api-key"
   ```

2. **Run Docker Compose**
   From the root of the project (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up -d --build
   ```
   This command builds the images and starts the containers in detached mode.

3. **Verify Deployment**
   - The backend will be available at `http://localhost:8000`.
   - The frontend will be available at `http://localhost:3000`.

4. **Expose to the Internet**
   To make it accessible over the internet, it's recommended to set up a reverse proxy (like Nginx or Caddy) to route traffic to ports `3000` (frontend) and `8000` (backend API) and handle SSL certificates (HTTPS).

## Post-Deployment Validation

After deploying, verify the system is working:
1. Visit the frontend URL.
2. Try running a search or multi-agent pipeline query.
3. Ensure the agents complete their execution without CORS or API key errors.
