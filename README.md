# Siva

A full-stack travel booking app (flights, hotels, bookings, admin panel) — Spring Boot backend + Next.js frontend.

This is an updated clone of a MakeMyTrip-style booking app, rebranded as **Siva** and upgraded to current tool versions.

## Stack

**Backend** (`/`)
- Java 21
- Spring Boot 4.1.1 (Spring Framework 7)
- Spring Data MongoDB
- Spring Security (BCrypt password hashing)
- Maven

**Frontend** (`/siva-frontend`)
- Next.js 16.3.3 (Pages Router)
- React 19.2
- TypeScript
- Tailwind CSS + shadcn/ui components
- Redux Toolkit
- Axios

## Getting started

### Backend

1. Set your MongoDB connection string in `src/main/resources/application.properties`:
   ```
   spring.data.mongodb.uri=<your mongodb url>
   spring.data.mongodb.database=siva
   ```
2. Run it:
   ```bash
   ./mvnw spring-boot:run
   ```
   The API starts on `http://localhost:8080`.

Or with Docker:
```bash
docker build -t siva-backend .
docker run -p 8080:8080 siva-backend
```

### Frontend

```bash
cd siva-frontend
npm install
npm run dev
```
Open `http://localhost:3000`. Set your backend URL in `src/api/index.js` (`BACKEND_URL`).

## API overview

- `POST /user/signup`, `POST /user/login`, `GET /user/email`, `POST /user/edit`
- `GET /flight`, `GET /hotel`
- `POST /admin/flight`, `POST /admin/hotel`, `PUT /admin/flight/{id}`, `PUT /admin/hotel/{id}`, `GET /admin/users`
- `POST /booking/flight`, `POST /booking/hotel`

## Project structure

```
siva/
├── src/main/java/com/siva/siva/
│   ├── controllers/   # REST controllers
│   ├── models/        # MongoDB documents
│   ├── repositories/  # Spring Data repositories
│   ├── services/      # Business logic
│   └── config/        # Security & CORS config
├── src/main/resources/application.properties
├── pom.xml
├── Dockerfile
└── siva-frontend/     # Next.js app
```
