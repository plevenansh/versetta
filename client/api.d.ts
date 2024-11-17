// api.d.ts
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../versenxt/src/server'; // Adjust this path as needed

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;