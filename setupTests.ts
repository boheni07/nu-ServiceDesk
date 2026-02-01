import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('./lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
        })),
    },
}));

// Mock console.error to avoid noisy logs during tests if needed,
// but usually better to verify errors are handled.
// vi.spyOn(console, 'error').mockImplementation(() => {});
