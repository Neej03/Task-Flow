# TaskFlow – Task Management Web Application

TaskFlow is a simple and user-friendly task management web application that helps users organize, manage, and track their daily tasks. It provides an interactive dashboard where users can add new tasks, update existing tasks, delete tasks, and manage their progress.

The application uses a responsive frontend, a Node.js and Express backend, and MongoDB Atlas for storing task data.

---

## 🚀 Features

- **Add Tasks:** Create new tasks with relevant details.
- **View Tasks:** Display all saved tasks on the dashboard.
- **Update Tasks:** Edit task information whenever required.
- **Delete Tasks:** Remove tasks that are no longer needed.
- **Task Status Management:** Manage task progress and completion.
- **Input Validation:** Prevent invalid or incomplete task entries.
- **Error Handling:** Handle API errors and invalid requests.
- **Database Integration:** Store and retrieve tasks using MongoDB Atlas.
- **Responsive Design:** Access the application on desktop, tablet, and mobile devices.
- **Interactive Dashboard:** Manage tasks through a clean and easy-to-use interface.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure of the application |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend functionality and interactions |
| Node.js | Backend runtime environment |
| Express.js | REST API and server-side routing |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| Git & GitHub | Version control and project hosting |

---

## 📁 Project Structure

```text
TaskFlow/
│
├── models/
│   └── Task.js
│
├── routes/
│   └── taskRoutes.js
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## ⚙️ Installation and Setup

Follow these steps to run TaskFlow on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/TaskFlow.git
```

### 2. Open the Project Folder

```bash
cd TaskFlow
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

Add the following configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection string.

**Important:** Never upload your `.env` file or database credentials to GitHub.

### 5. Start the Application

```bash
npm start
```

If your project does not have a start script configured, you can run:

```bash
node server.js
```

### 6. Open in Browser

Visit:

```text
http://localhost:5000
```

Your TaskFlow application should now be running locally.

---

## 🔗 API Endpoints

TaskFlow uses REST APIs to communicate between the frontend and backend.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Fetch all tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Example API Operations

**GET – Fetch Tasks**

```http
GET /api/tasks
```

**POST – Create Task**

```http
POST /api/tasks
Content-Type: application/json
```

Example request body:

```json
{
  "title": "Complete DBMS Assignment",
  "description": "Finish the pending DBMS questions",
  "status": "Pending"
}
```

**PUT – Update Task**

```http
PUT /api/tasks/TASK_ID
```

**DELETE – Delete Task**

```http
DELETE /api/tasks/TASK_ID
```

*Note: Request fields and status values should match the validation and schema defined in your project.*

---

## 🗄️ Database

TaskFlow uses **MongoDB Atlas** as its cloud database.

- Task information is stored in a MongoDB collection.
- Mongoose is used to define the task model and interact with the database.
- The backend handles database operations through Express routes.
- Environment variables are used to keep database credentials secure.

---

## 🖥️ Application Screenshot

```text
screenshots/
├── dashboard.png
```

### Dashboard

![TaskFlow Dashboard](screenshots/dashboard.png)

---

## 🧪 Testing

The application has been tested for its main functionality, including:

- Creating new tasks.
- Displaying saved tasks.
- Updating existing tasks.
- Deleting tasks.
- Validating user inputs.
- Handling invalid API requests.
- Handling backend errors.
- Connecting and communicating with MongoDB Atlas.

---

## 🔒 Security

- Database credentials are stored in environment variables.
- The `.env` file is excluded from Git tracking.
- Input validation is implemented to reduce invalid data.
- API error handling helps manage unexpected requests.

---

## 🔮 Future Improvements

Some features that can be added in future versions:

- User registration and login.
- Individual user task management.
- Task deadlines and reminders.
- Priority-based task organization.
- Search and advanced filtering.
- Dark and light themes.
- Task analytics and productivity reports.
- Notifications for upcoming deadlines.

---

## 👨‍💻 Author

**Developed as a project to demonstrate full-stack web development using HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB.**

---

## 📄 License

This project is open-source and available for educational and learning purposes.

---

⭐ If you find this project useful, consider giving the repository a star on GitHub.

**Thank you for checking out TaskFlow!**
