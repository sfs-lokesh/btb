
import { EventEmitter } from 'events';

// This is a simple server-side event emitter to broadcast changes
// across different serverless function invocations.
export const Emitter = new EventEmitter();
