import { Request, Response, NextFunction } from 'express';

const cache = new Map();
const DURATION = 60 * 1000; // 1 minute

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests to /api/videos without query params for simplicity in this demo
    if (req.method !== 'GET' || Object.keys(req.query).length > 0) {
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        if (Date.now() - cachedResponse.timestamp < DURATION) {
            res.send(cachedResponse.data);
            return;
        } else {
            cache.delete(key);
        }
    }

    // Override res.send to store response in cache
    const originalSend = res.send;
    res.send = (body: any) => {
        cache.set(key, { data: body, timestamp: Date.now() });
        return originalSend.call(res, body);
    };

    next();
};

export const clearCache = () => {
    cache.clear();
};
