import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { User, Test } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AUTH: Login/Register by Email
  app.post('/api/auth', async (c) => {
    const { email, name } = await c.req.json() as { email?: string, name?: string };
    if (!email?.trim()) return bad(c, 'Email is required');
    // Simple deterministic ID from email for this demo (In prod, use proper auth)
    // We use a simple hash or just the email sanitized as ID for simplicity in this environment
    const userId = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const userEntity = new UserEntity(c.env, userId);
    let user = await userEntity.getState();
    // If new user, set name
    if (!user.email) {
        await userEntity.save({
            id: userId,
            email: email.trim(),
            name: name?.trim() || 'Student',
            tests: [],
            createdAt: Date.now()
        });
        user = await userEntity.getState();
    }
    return ok(c, user);
  });
  // GET USER
  app.get('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const userEntity = new UserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    return ok(c, await userEntity.getState());
  });
  // UPDATE USER (PATCH)
  app.patch('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const updates = await c.req.json() as Partial<User>;
    // Prevent updating protected fields if necessary, but for now allow basic profile updates
    // Filter out id, tests, createdAt to be safe if needed, or trust the Entity logic
    const safeUpdates: Partial<User> = {};
    if (updates.name) safeUpdates.name = updates.name;
    if (updates.avatarUrl !== undefined) safeUpdates.avatarUrl = updates.avatarUrl;
    const userEntity = new UserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    await userEntity.patch(safeUpdates);
    return ok(c, await userEntity.getState());
  });
  // ADD TEST
  app.post('/api/users/:id/tests', async (c) => {
    const userId = c.req.param('id');
    const test = await c.req.json() as Test;
    if (!test.id || !test.subject || !test.date) return bad(c, 'Invalid test data');
    const userEntity = new UserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    const updatedUser = await userEntity.addTest(test);
    return ok(c, updatedUser);
  });
  // TOGGLE SESSION
  app.post('/api/users/:id/tests/:testId/sessions/:sessionId/toggle', async (c) => {
    const { id, testId, sessionId } = c.req.param();
    const userEntity = new UserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    const updatedUser = await userEntity.toggleSession(testId, sessionId);
    return ok(c, updatedUser);
  });
  // DELETE TEST
  app.delete('/api/users/:id/tests/:testId', async (c) => {
      const { id, testId } = c.req.param();
      const userEntity = new UserEntity(c.env, id);
      if (!await userEntity.exists()) return notFound(c, 'User not found');
      const updatedUser = await userEntity.deleteTest(testId);
      return ok(c, updatedUser);
  });
}