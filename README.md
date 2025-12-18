# Behind The Build

This is a Next.js application for running a real-time pitch rating contest. It includes a user-facing voting interface and a comprehensive admin dashboard for managing pitches, categories, and visibility.

## Features

- **User Voting:** View and rate pitches in real-time.
- **Admin Dashboard:** A secure area to manage the entire application.
  - Add, remove, and edit pitches.
  - Create and manage categories for pitches.
  - Control pitch visibility in real-time.
- **Category-based Winners:** The system automatically identifies and highlights the winner for each category.
- **Authentication:** The admin panel is protected by a simple username/password login.

## Getting Started

Follow these steps to get the project running locally.

### 1. Install Dependencies

First, install the necessary npm packages:

```bash
npm install
```

### 2. Run the Development Server

Once the dependencies are installed, you can start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

- The user voting page is at `/`.
- The admin login page is at `/login`.

## How to Connect to MongoDB

Currently, the application uses React Context (`src/context/PitchContext.tsx`) to manage its state in memory. This means all data is lost when the server restarts. To persist your data, you need to connect the application to a MongoDB database.

Here is a step-by-step guide to do that:

### Step 1: Set Up Your MongoDB Database

1.  Create a free or paid MongoDB Atlas account, or run a MongoDB instance locally.
2.  Get your MongoDB connection string (URI). It will look something like this: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority`.

### Step 2: Configure Environment Variables

1.  In the root of your project, create a new file named `.env.local`.
2.  Add your MongoDB connection string to this file:

    ```env
    MONGODB_URI="your_mongodb_connection_string_here"
    ```

### Step 3: Create API Routes

To interact with your database from the client-side, you'll need to create API routes in Next.js.

1.  **Create a Pitch Model:** Define the schema for your pitches. You can create a file like `src/models/Pitch.ts`:

    ```typescript
    import mongoose from 'mongoose';

    const PitchSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      presenter: { type: String, required: true },
      imageUrl: { type: String, required: true },
      category: { type: String, required: true },
      ratings: { type: [Number], default: [] },
      visible: { type: Boolean, default: true },
    });

    export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema);
    ```

2.  **Build API Endpoints:** Create API routes for handling pitches, for example, `src/app/api/pitches/route.ts`. You'll need endpoints to get, create, update, and delete pitches.

### Step 4: Modify PitchContext

The final step is to replace the local state management in `src/context/PitchContext.tsx` with fetch calls to your new API routes.

Instead of using `useState` to manage pitches, you will:

1.  Use a `useEffect` hook to fetch all pitches from your `/api/pitches` endpoint when the component mounts.
2.  Modify functions like `addPitch`, `removePitch`, and `togglePitchVisibility` to send `POST`, `DELETE`, and `PUT` requests to your API endpoints instead of just updating local state.
3.  After each successful API call, you would then re-fetch the data or update the local state to ensure the UI is in sync with the database.

By following these steps, you can transition from the in-memory state to a fully persistent database-driven application.
