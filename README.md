# 🎓 Student Success Platform

A cloud-native SaaS platform designed to help university students manage, monitor, and improve their academic performance throughout their degree program.

---

## 📖 Overview

Student Success Platform provides a centralized academic management system where students can:

* Manage semesters and subjects
* Track assignments and exams
* Calculate GPA automatically
* Monitor academic progress
* Set academic goals
* Receive important reminders
* Visualize academic performance through analytics

Instead of relying on spreadsheets, notes, and manual GPA calculations, students can access all academic information through a modern web-based dashboard.

---

## 🎯 Project Goals

The primary objective of this project is to build a realistic SaaS application that demonstrates:

* Microservices Architecture
* Full-Stack Development
* REST API Development
* Database Design
* JWT Authentication
* Cloud-Native Application Design

---

## 🚀 Features

### 🔐 Authentication & Profile Management

* User Registration
* Secure Login
* JWT Authentication
* Profile Management
* Password Management

---

### 📚 Semester Management

Students can:

* Create Semesters
* Update Semester Information
* View Semester History
* Track Academic Progress

---

### 📖 Subject Management

Students can:

* Add Subjects
* Define Credit Values
* Manage Subject Information
* Track Grades

---

### 📝 Assignment Tracking

Students can:

* Create Assignments
* Set Deadlines
* Track Progress
* Store Marks

Assignment Status:

* Pending
* In Progress
* Completed
* Overdue

---

### 🧪 Exam Management

Students can:

* Schedule Exams
* Record Marks
* Track Performance
* Manage Exam Information

---

### 📊 GPA Management

Students can:

* Calculate Semester GPA (SGPA)
* Calculate Cumulative GPA (CGPA)
* View GPA History
* Predict Future GPA

---

### 🎯 Academic Goals

Students can:

* Set Target GPA
* Track Goal Progress
* Monitor Academic Objectives

Examples:

* Achieve GPA 3.80+
* Maintain Dean’s List
* Improve Subject Performance

---

### 📈 Analytics Dashboard

The dashboard provides:

* GPA Trends
* Assignment Completion Rate
* Subject Performance Analysis
* Academic Progress Tracking
* Goal Achievement Progress

---

### 🔔 Notification Center

Students receive:

* Assignment Reminders
* Exam Reminders
* GPA Updates
* Goal Progress Notifications

---

# 🏗️ System Architecture

```text
Client Browser
       │
       ▼

React Frontend
       │
       ▼

Nginx Reverse Proxy
       │
 ┌─────┼──────────┬──────────┐
 │     │          │          │
 ▼     ▼          ▼          ▼

Auth Academic   GPA   Notification
Service Service Service Service

       │
       ▼

PostgreSQL Database
```

---

# 🧩 Microservices

## Auth Service

Responsibilities:

* User Registration
* User Login
* JWT Authentication
* Profile Management

Base Route:

```http
/api/auth
```

---

## Academic Service

Responsibilities:

* Semester Management
* Subject Management
* Assignment Management
* Exam Management

Base Route:

```http
/api/academic
```

---

## GPA Service

Responsibilities:

* SGPA Calculation
* CGPA Calculation
* GPA History
* GPA Prediction

Base Route:

```http
/api/gpa
```

---

## Notification Service

Responsibilities:

* Assignment Notifications
* Exam Notifications
* Goal Reminders
* GPA Updates

Base Route:

```http
/api/notifications
```

---

# ⚙️ Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* React Router
* Axios
* Recharts

## Backend

* Node.js
* Express.js
* Prisma ORM

## Database

* PostgreSQL

## Authentication

* JWT
* bcrypt

## Reverse Proxy

* Nginx

## Documentation

* Swagger / OpenAPI

---

# 🗄️ Database Design

Core Tables

```text
users

semesters

subjects

assignments

exams

grades

gpa_records

notifications
```

Relationship Flow

```text
User
 │
 └── Semester
        │
        └── Subject
               │
               ├── Assignment
               ├── Exam
               └── Grade
                       │
                       └── GPA Record
```

---

# 📁 Project Structure

```text
student-success-platform/

├── frontend/

├── services/
│   ├── auth-service/
│   ├── academic-service/
│   ├── gpa-service/
│   └── notification-service/

├── nginx/
│   └── nginx.conf

├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── ER-Diagram

├── docs/
│   ├── Architecture-Diagram
│   ├── API-Documentation
│   └── Technical-Report

├── docker-compose.yml

├── README.md

└── .gitignore
```

---

# 📡 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

---

## Academic

```http
GET    /api/academic/semesters
POST   /api/academic/semesters

GET    /api/academic/subjects
POST   /api/academic/subjects

GET    /api/academic/assignments
POST   /api/academic/assignments

GET    /api/academic/exams
POST   /api/academic/exams
```

---

## GPA

```http
POST /api/gpa/calculate
GET  /api/gpa/history
POST /api/gpa/predict
```

---

## Notifications

```http
GET  /api/notifications
POST /api/notifications
PUT  /api/notifications/read
```

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Protected API Routes
* Input Validation
* Environment Variable Configuration
* Secure Authentication Flow

---

# 📊 Frontend Modules

* Login
* Dashboard
* Semester Management
* Subject Management
* Assignment Tracking
* Exam Management
* GPA Analytics
* Notification Center
* Profile
* Settings

---

# 📈 Development Progress

### Completed

* Requirements Analysis
* System Architecture Design
* Database Design
* ER Diagram
* PostgreSQL Setup
* Frontend UI Development
* Page Design Implementation
* Nginx Architecture Planning

### Current Phase

* Backend Foundation
* Microservice Setup

### Upcoming

* Auth Service Development
* JWT Authentication
* Frontend Integration
* Academic Service Development
* GPA Service Development
* Notification Service Development

---

# 🎯 Expected Outcomes

The completed system will allow students to:

* Organize academic records
* Track assignments and exams
* Calculate GPA automatically
* Analyze academic performance
* Improve academic planning
* Monitor progress toward goals

This project demonstrates practical implementation of:

* SaaS Architecture
* Microservices
* Full-Stack Development
* REST APIs
* PostgreSQL Database Design
* Secure Authentication
* Cloud-Native Software Design

---

## 👨‍💻 Project Status

🚧 Currently Under Development

Frontend: Completed

Database Design: Completed

Backend Services: In Progress

Deployment & DevOps: Planned

Finished.....