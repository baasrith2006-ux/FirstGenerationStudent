# PathWise Backend & Supabase Setup

This backend is powered by **Supabase** (PostgreSQL). Follow these steps to transform your development environment.

## 1. Supabase Initialization

1. Create a project at [Supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `schema.sql` (found in the `backend/` directory) and click **Run**.
4. This will create all necessary tables: `users`, `subjects`, `tasks`, `planner_sessions`, `chats`, `syllabus_topics`, and `test_history`.

## 2. Environment Variables

Update your `backend/.env` file with your specific credentials:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-role-key
```

## 3. Architecture Overview

- **`index.js`**: Main entry point using Express.
- **`supabase.js`**: Singleton client for database communication.
- **`routes/`**: Modularized API endpoints mapped 1:1 with frontend features.
- **`middleware/`**: Centralized error handling and processing.

## 4. Frontend Compatibility

The backend automatically maps Supabase's `id` field to `_id` in responses. This ensures that the existing frontend logic (designed for MongoDB) works perfectly without any refactoring.

---
*Happy Coding!*
