
# 🍔 Food Express

Food Express is a full-stack food ordering web application that allows customers to browse food items, manage their wishlist and cart, place orders, and track order status. It also provides an admin panel for managing products, categories, coupons, and customer orders.

## 🚀 Features

### Customer Features
- User registration and authentication
- Browse food items and categories
- View product details
- Add and remove items from the cart
- Manage wishlist
- Place food orders
- View personal orders and order history
- Track order status
- Receive order status notifications
- Mark notifications as read

### Admin Features
- Admin authentication
- Admin dashboard
- Create, update, and manage categories
- Create, update, and manage products
- Manage coupons
- View all customer orders
- Update order statuses
- View order status history
- Receive notifications when new orders are placed

### Notification System
- Admin notifications for new orders
- Customer notifications for order status changes
- Unread notification count
- Notification dropdown with automatic refresh
- Mark notifications as read
- Status-specific notification messages

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- JavaScript
- CSS and Bootstrap (where used)

### Backend
- Node.js
- Express.js
- REST API

### Database and Authentication
- Supabase
- PostgreSQL
- JWT-based authentication
- HTTP-only cookies

## 📁 Project Structure

```text
food-ordering-website/
├── client/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

*The folder structure above is illustrative. Keep the actual structure of your project.*

## ⚙️ Prerequisites

Install the following before running the application:

- Node.js and npm
- Git
- A Supabase project
- A modern web browser

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/vishwas-44/food-express.git
cd food-express
```

### 1. Install frontend dependencies

```bash
cd client
npm install
```

### 2. Install backend dependencies

Open another terminal, or return to the project root:

```bash
cd server
npm install
```

## 🔐 Environment Variables

Configure the environment variables required by your application before starting it.

Create the appropriate `.env` files in the frontend and backend directories according to the variable names used in your existing code.

Typical backend configuration may include:

```env
PORT=8000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET_KEY_ACCESS_TOKEN=your_access_token_secret
JWT_SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD_HASH=your_admin_password_hash
```

Your application may require additional environment variables depending on its existing configuration.

**Security:** Never commit real API keys, service-role keys, JWT secrets, email passwords, or `.env` files to GitHub. Use placeholder values in documentation.

## ▶️ Running the Application

### Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend is expected to run at:

```text
http://localhost:8000
```

Ensure your backend `package.json` contains the appropriate development script.

### Start the frontend

From the `client` directory:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## 🔔 Notifications

The notification system uses the Supabase `notifications` table.

It supports two recipient types:

- `admin` — receives notifications when customers place orders.
- `customer` — receives notifications when administrators change order statuses.

Supported order statuses include:

- Processing
- Confirmed
- Preparing
- Out for Delivery
- Delivered
- Cancelled

Notifications contain a title, message, order reference, read status, and creation timestamp.

## 🗄️ Database

The application uses Supabase PostgreSQL to store application data.

Depending on the existing implementation, the database includes tables for:

- Users
- Categories
- Products
- Orders
- Order items
- Order status history
- Addresses
- Coupons
- Notifications

Configure your Supabase project and required database schema before running the application.

## 🔒 Security Notes

- Keep environment variables out of version control.
- Do not expose service-role keys in frontend code.
- Use server-side authentication and authorization for admin operations.
- Validate incoming API requests.
- Restrict access to customer-specific orders and notifications.
- Configure production environment variables securely.

## 🚧 Future Improvements

- Online payment integration
- Real-time order tracking
- Browser push notifications
- Improved reporting and analytics
- Automated testing
- Production deployment

## 👨‍💻 Author

**Vishwas**

GitHub: [@vishwas-44](https://github.com/vishwas-44)

## 📄 License

No license has been specified yet.
=======
# food-express
Food Express – Full-stack food ordering web application built with Next.js, Node.js, Express, and Supabase.
>>>>>>> cdf136e1cebbb81d5d22aeac38643246ab2fb43b
