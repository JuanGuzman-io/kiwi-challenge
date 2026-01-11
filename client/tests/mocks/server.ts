/**
 * MSW test server setup
 * Configures Mock Service Worker for test environment
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with handlers
export const server = setupServer(...handlers);
