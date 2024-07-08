"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicProcedure = exports.router = void 0;
// src/trpc.ts
const server_1 = require("@trpc/server");
const t = server_1.initTRPC.create();
exports.router = t.router;
exports.publicProcedure = t.procedure;
