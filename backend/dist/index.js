"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@trpc/server/adapters/express");
const trpc_1 = require("./trpc"); // Import the router from trpc.ts
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/trpc', (0, express_2.createExpressMiddleware)({
    router: trpc_1.appRouter,
    createContext: () => ({}),
}));
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
