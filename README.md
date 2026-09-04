# IRONMAN

Full-stack application with separate frontend and backend projects.

## Structure

- `frontend/` contains the user interface and browser-side code.
- `backend/` contains the API, business logic, and server-side code.

The frontend should communicate with the backend through its documented API rather than importing backend code directly. Keep changes in both folders in the same commit when a feature crosses the API boundary so the repository stays synchronized.
