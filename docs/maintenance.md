# SmartNotepad Maintenance

Changes should preserve user isolation, Supabase authentication, and note persistence. Treat database queries and auth callbacks as security-sensitive code.

## Checks
- Run the production build.
- Review RLS assumptions for changed queries.
- Test signed-out and signed-in behavior.
- Confirm users cannot access another user's notes.
