# DotEye Order Tracker Backend

Node.js + Express + MongoDB Atlas + Mongoose + JWT + Socket.IO backend for the
DotEye Order Tracker application.

Production backend: https://doteyeordertracker-backend.onrender.com

The backend is deployed as one Render Web Service. Express REST endpoints and
Socket.IO run on the same persistent Node.js HTTP server.s
## Setup

```bash
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

`PORT` is used locally. Render supplies its own `PORT` automatically.

Run development server:

```bash
npm run dev
```

## Render deployment

Deploy this repository as one Render Web Service. The `start` script runs
`server.js`, which creates the HTTP server, attaches Socket.io to that same
server, connects to MongoDB Atlas, and listens on Render's `PORT`. No separate
Socket.io deployment is required.

In Render, add these environment variables:

- `MONGO_URI`: the MongoDB Atlas connection string.
- `JWT_SECRET`: a long random secret.
- `JWT_EXPIRES_IN`: for example, `7d`.
- `CLIENT_URL`: the exact deployed frontend URL, without a trailing slash.

The production frontend is deployed on Vercel. Set the following in Render:

```env
CLIENT_URL=https://dot-eye-order-tracker-front-end.vercel.app
```

Use the exact frontend origin without a trailing slash, then redeploy the
backend. CORS does not change the API routes; it controls which browser origin
may call them.

MongoDB Atlas must allow connections from Render. For an initial showcase,
Atlas Network Access may temporarily allow `0.0.0.0/0`; use database
credentials with least privilege and restrict access later when appropriate.

### Production URLs

- REST base URL: `https://doteyeordertracker-backend.onrender.com/api`
- Socket.IO URL: `https://doteyeordertracker-backend.onrender.com`
- Health check: `https://doteyeordertracker-backend.onrender.com/api`

Example frontend configuration:

```env
VITE_API_BASE_URL=https://doteyeordertracker-backend.onrender.com/api
VITE_SOCKET_URL=https://doteyeordertracker-backend.onrender.com
```

Socket.IO clients authenticate with the same JWT returned by the login API:

```js
io('https://doteyeordertracker-backend.onrender.com', {
	auth: {token},
})
```

The free Render instance may sleep after inactivity, so the first request or
Socket.IO connection can take several seconds while the service wakes up.

Seed sample data:

```bash
npm run seed
```

The seed command is destructive by design. It clears the application collections
and recreates a consistent demo tenant containing users, orders, disputes, and
order-scoped chat history.

## Seed credentials

Customer demo accounts (all use password `Customer@123`):

- Vikash Potnuru — `vikash@example.com`
- Ananya Rao — `ananya@example.com`
- Rahul Sharma — `rahul@example.com`
- Priya Reddy — `priya@example.com`
- Arjun Kumar — `arjun@example.com`
- Meera Nair — `meera@example.com`

Admin:

- Name: `DotEye Support Admin`
- Email: `admin@doteyelabs.com`
- Password: `DotEye@123`

## REST API

### Auth

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Orders

- GET `/api/orders`
- GET `/api/orders/metadata`
- GET `/api/orders/my-orders`
- GET `/api/orders/:orderId`
- GET `/api/orders/:orderId/timeline`
- POST `/api/orders`
- PATCH `/api/orders/:orderId/status`
- PATCH `/api/orders/:orderId/cancel`

### Messages

- GET `/api/orders/:orderId/messages`
- GET `/api/orders/messages/all`
- POST `/api/orders/:orderId/messages`
- PATCH `/api/orders/:orderId/messages/read`

### Disputes

- POST `/api/disputes`
- GET `/api/disputes`
- GET `/api/disputes/my-disputes`
- GET `/api/disputes/:disputeId`
- PATCH `/api/disputes/:disputeId/status`

Dispute list and detail responses include the normalized `customer` object and
an `order` summary in addition to the persisted dispute fields. This keeps
customer and order context consistent for admin screens without requiring a
second client-side lookup.

### Dashboard

- GET `/api/dashboard/customer`
- GET `/api/dashboard/admin`

## Socket.io events

Client sends:

- `join-order`
- `leave-order`
- `typing-start`
- `typing-stop`

Server emits:

- `joined-order`
- `socket-error`
- `order-status-updated`
- `new-message`
- `messages-read`
- `dispute-updated`
- `typing-start`
- `typing-stop`

Every order uses its order ID as the Socket.io room ID.

## Request body examples

### Create order

```json
{
	"customerId": "USR-002",
	"items": [
		{"name": "USB-C Dock", "quantity": 1, "price": 7499}
	]
}
```

### Change order status

```json
{
	"status": "Shipped",
	"note": "Package handed to the delivery partner."
}
```

### Create dispute

```json
{
	"orderId": "ORD-1002",
	"reasonCategory": "Item Not Received",
	"description": "The delivery window has passed and the package has not arrived."
}
```

### Resolve dispute

```json
{
	"status": "Resolved (Refunded)",
	"adminResolutionNotes": "Refund approved after delivery investigation."
}
```
