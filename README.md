# Root Cause Report - GrocerSmart Data Display Issues

## 1. What was wrong
*   **API Interceptor Issues**: The `axios.js` interceptor was returning a new object `{ ...response, data: unwrappedData }` which sometimes confused Axios or resulted in unexpected structures if the response didn't perfectly match the `hasOwnProperty` checks.
*   **Data Shape Mismatches**: Some components were directly setting state from `response.data` without ensuring it was an array. When the backend returned a single object (e.g. for search) or a paginated `Page` object that wasn't correctly unwrapped, components would crash or fail to filter data for the table.
*   **Inconsistent Unwrapping**: The logic to unwrap Spring Data `Page.content` was present but fragile, leading to cases where the table received an object instead of an array.
*   **Port Mismatch (Potential)**: Frontend was configured for port 8081, which is correct as per `application.properties`, but missing error handling in some components could hide connection errors.

## 2. Changes Applied
### Backend Config
*   Verified `SecurityConfig.java` allows `http://localhost:5173` and common HTTP methods.
*   Confirmed `ApiResponse` and `Page` shapes match the frontend's unwrapping logic.

### Frontend API Layer (`src/api/axios.js`)
*   **Standardized Unwrapping**: Refactored response interceptor to safely modify `response.data` in-place when a wrapped `ApiResponse` is detected.
*   **Improved Resilience**: Added robust checks for `Page` objects and ensured non-array data doesn't break the flow.
*   **Enhanced Error Handling**: Added immediate redirect to `/login` on `401 Unauthorized` and better toast messages for validation errors.

### Frontend Pages
*   **Defensive State Updates**: Added `Array.isArray()` checks to all list-fetching logic (`setProducts`, `setUsers`, etc.) to guarantee that `DataTable` always receives an array.
*   **Optimized Fetching**: Updated `PurchaseOrderDetails.jsx` to use the specific `GET /api/purchase-orders/:id` endpoint instead of filtering the entire list client-side.
*   **Loading States**: Verified all pages correctly pass the `loading` state to `DataTable` to show skeletons during fetch.

## 3. How to verify
1. Open the browser and go to `http://localhost:5173`.
2. Open **DevTools (F12) -> Network tab**.
3. Navigate to any module (Users, Products, etc.).
4. Verify the request to `http://localhost:8081/api/...` returns a `200 OK`.
5. Check that the response JSON has `"success": true` and `"data": [...]`.
6. Confirm the table renders rows. If the list is empty, you should see a professional "No records found" state instead of a blank page or console errors.

## Confirmations
*   **Base URL**: `http://localhost:8081/api`
*   **Response Shape**: Standardized to unwrap `{ data: { content: [] } }` or `{ data: [] }`.
*   **Axios Instance**: Single instance in `src/api/axios.js` used by all services.
