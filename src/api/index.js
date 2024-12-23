import express from 'express';

const router = express.Router();

import { itemRouter } from './items.js';

router.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to API"
    });
});

router.use('/items', itemRouter);

export { router };
