# Setup Instructions

This application now runs completely locally (except for the Claude API calls).

## Prerequisites

- Node.js (v18 or higher)
- An Anthropic API key

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your Anthropic API key:
     ```
     ANTHROPIC_API_KEY=your_actual_api_key_here
     ```
   - Get your API key from: https://console.anthropic.com/

3. **Start the application:**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend dev server on `http://localhost:8080`
   - Backend API server on `http://localhost:3001`

4. **Open your browser:**
   Navigate to `http://localhost:8080`

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js server (server.js)
- **API**: Calls Claude API directly from the backend
- **Storage**: LocalStorage for persisting code and diagrams

## What Changed

Previously, this app used Supabase Functions (cloud-hosted). Now:
- ✅ Backend runs locally on your machine
- ✅ API key stays in your local `.env` file
- ✅ No external dependencies except Claude API
- ✅ Full control over your code and data
