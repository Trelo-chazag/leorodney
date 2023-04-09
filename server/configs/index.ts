// setup configuration middleware
import MongoStore from "connect-mongo";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { csrf, csrfOptions } from "lusca";

/** 
 * setup limiter middleware (rate limiter) configuration 
 * */
export const limiterConfig = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 10 // limit each IP to 10 requests per windowMs
});

/**
 * setup csrf middleware configuration to prevent cross site request forgery
 */
export const csrfConfig = csrf({
    csrf: true, 
    csp: false, // Content Security Policy
    xframe: "SAMEORIGIN", // SAMEORIGIN, DENY, ALLOW-FROM
    hsts: { 
        maxAge: 31536000, // Must be at least 1 year to be approved
        includeSubDomains: true, // Must be enabled to be approved
        preload: true // https://hstspreload.org/
    },
    xssProtection: true, // https://www.owasp.org/index.php/List_of_useful_HTTP_headers
} as csrfOptions );

/** 
 * setup cors middleware configuration to be compatible with the client cookies bag
 * */
export const corsConfig = cors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    credentials: true, // allow session cookie from browser to pass through
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

/** 
 * setup session middleware configuration with mongodb store
 * */
export const sessionConfig = session({
    name: "leorodney.sid",
    secret: process.env.SESSION_SECRET as string,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === "production", // only set cookies over https
        httpOnly: true, // don't let browser javascript access cookie ever
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL as string,
        dbName: process.env.MONGODB_DB as string,
        collectionName: "sessions",
        stringify: false, // don't convert session object to string
        ttl: 60 * 60 * 24, // 1 day
    }),
});