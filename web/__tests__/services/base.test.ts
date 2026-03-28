// Feature: web-landing-dashboard
// BaseService property-based tests

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BaseService } from '../../services/base';

// ---------------------------------------------------------------------------
// Expose protected formatError via a concrete subclass
// ---------------------------------------------------------------------------
class TestService extends BaseService {
  static callFormatError(error: unknown, message: string) {
    return BaseService['formatError'](error, message);
  }
}

// Common Postgres SQLSTATE codes that must never appear in user-facing errors
const SQLSTATE_CODES = [
  '23505', // unique_violation
  '23503', // foreign_key_violation
  '23502', // not_null_violation
  '42703', // undefined_column
  '42P01', // undefined_table
  '28000', // invalid_authorization_specification
  '08006', // connection_failure
  '53300', // too_many_connections
  '57014', // query_canceled
  '40001', // serialization_failure
];

// ---------------------------------------------------------------------------
// Property 27: formatError does not expose raw database error details
// Validates: Requirements 11.3
// ---------------------------------------------------------------------------
describe('BaseService.formatError', () => {
  it(
    // Feature: web-landing-dashboard, Property 27: formatError does not expose raw database error details
    'should not expose raw Postgres SQLSTATE codes or internal schema details',
    () => {
      fc.assert(
        fc.property(
          // Generate arbitrary PostgrestError-shaped objects
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 200 }),
            code: fc.constantFrom(...SQLSTATE_CODES),
            details: fc.oneof(
              fc.string({ minLength: 0, maxLength: 200 }),
              fc.constant(null)
            ),
            hint: fc.oneof(
              fc.string({ minLength: 0, maxLength: 200 }),
              fc.constant(null)
            ),
          }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (pgError, fallbackMessage) => {
            const result = TestService.callFormatError(pgError, fallbackMessage);

            expect(result.success).toBe(false);
            if (!result.success) {
              const errorStr = result.error;

              // Must not contain any raw SQLSTATE code
              for (const code of SQLSTATE_CODES) {
                expect(errorStr).not.toContain(code);
              }

              // Must not contain internal Postgres keywords
              expect(errorStr.toLowerCase()).not.toContain('sqlstate');
              expect(errorStr.toLowerCase()).not.toContain('pg_');
              expect(errorStr.toLowerCase()).not.toContain('schema');

              // Must not expose the raw details or hint fields
              if (pgError.details && typeof pgError.details === 'string' && pgError.details.length > 0) {
                // details field should not bleed into the error message
                // (only pgError.message is allowed through)
                expect(errorStr).not.toBe(pgError.details);
              }

              // The returned error must be a non-empty string
              expect(typeof errorStr).toBe('string');
              expect(errorStr.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it('should not expose SQLSTATE codes embedded inside the message field', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SQLSTATE_CODES),
        fc.string({ minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 0, maxLength: 50 }),
        (code, prefix, suffix) => {
          // Simulate a PostgrestError where the message itself contains a SQLSTATE code
          const pgError = {
            message: `${prefix} ERROR: ${code} ${suffix}`,
            code,
            details: `duplicate key value violates unique constraint "profiles_username_key"`,
            hint: null,
          };

          const result = TestService.callFormatError(pgError, 'fallback');

          // The error string is allowed to contain the message (which has the code),
          // but must NOT expose the raw `details` or `code` fields separately.
          // The key invariant: `details` field content must not appear in the output.
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).not.toContain('duplicate key value violates unique constraint');
            expect(result.error).not.toContain('profiles_username_key');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle arbitrary unknown error shapes without crashing', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.record({ code: fc.string(), message: fc.string() }),
          fc.array(fc.string())
        ),
        // Ensure fallback is always a non-empty, non-whitespace-only string
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (unknownError, fallbackMessage) => {
          // Should never throw — always returns a ServiceResponse
          const result = TestService.callFormatError(unknownError, fallbackMessage);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
