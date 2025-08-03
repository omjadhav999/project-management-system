import MongoStore from 'connect-mongo';
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Enable CORS BEFORE session & passport middleware
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Session middleware
// // app.use(
// //   session({
// //     secret: config.SESSION_SECRET,
// //     resave: false,
// //     saveUninitialized: false,
// //     cookie: {
// //       secure: false, // Set to true if using HTTPS in production
// //       httpOnly: true, // Recommended for security
// //       sameSite: "lax", // Adjust to "none" if frontend/backend on different domains with HTTPS
// //       maxAge: 24 * 60 * 60 * 1000, // 1 day
// //     },
// //   })
// // );

// // app.use(
// //   session({
// //     secret: config.SESSION_SECRET,
// //     resave: false,
// //     saveUninitialized: false,
// //     cookie: {
// //       secure: process.env.NODE_ENV === 'production', // Will be true in production with HTTPS
// //       httpOnly: true,
// //       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
// //       maxAge: 24 * 60 * 60 * 1000, // 1 day
// //     },
// //   })
// // );

// // Session middleware with MongoDB store
// app.use(
//   session({
//     secret: config.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: config.MONGO_URI,
//       collectionName: 'sessions',
//       ttl: 24 * 60 * 60, // 1 day in seconds
//     }),
//     cookie: {
//       secure: process.env.NODE_ENV === 'production',
//       httpOnly: true,
//       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     },
//   })
// );

// // app.use((req, res, next) => {
// //   console.log("User in session:", req.user);
// //   next();
// // });

// app.use((req, res, next) => {
//   console.log("Session ID:", req.sessionID);
//   console.log("User in session:", req.user);
//   console.log("Is authenticated:", req.isAuthenticated?.());
//   next();
// });

// // Initialize Passport and session
// app.use(passport.initialize());
// app.use(passport.session());

// Session middleware with MongoDB store
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGO_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport BEFORE debug middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware AFTER passport
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("User in session:", req.user);
  console.log("Is authenticated:", req.isAuthenticated?.());
  next();
});

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel & share",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
