/**
 * Vitest Test Setup
 * Configures testing environment and global utilities
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_APP_ENVIRONMENT', 'development');
vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'false');
