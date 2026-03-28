// Feature: web-landing-dashboard, Property 5: Login form client-side validation rejects invalid inputs
import fc from 'fast-check';
import { loginSchema } from '@/lib/schemas/login';

test('loginSchema rejects invalid email with any password length', () => {
  fc.assert(
    fc.property(
      // Generate strings that are NOT valid emails (no @ or no domain)
      fc.oneof(
        fc.string({ maxLength: 20 }).filter((s) => !s.includes('@')),
        fc.constant(''),
        fc.constant('notanemail'),
        fc.constant('@nodomain'),
        fc.constant('missing@'),
      ),
      fc.string({ minLength: 8, maxLength: 30 }),
      (email, password) => {
        const result = loginSchema.safeParse({ email, password });
        expect(result.success).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});

test('loginSchema rejects valid email with password shorter than 8 chars', () => {
  fc.assert(
    fc.property(
      fc.emailAddress(),
      fc.string({ maxLength: 7 }),
      (email, password) => {
        const result = loginSchema.safeParse({ email, password });
        expect(result.success).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
