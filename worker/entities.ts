import { IndexedEntity } from "./core-utils";
import type { User, Test, StudySession } from "@shared/types";
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { 
    id: "", 
    name: "", 
    email: "", 
    tests: [],
    createdAt: Date.now()
  };
  // Helper to ensure state is initialized with correct ID if created via generic create
  protected override async ensureState(): Promise<User> {
    const s = await super.ensureState();
    if (!s.tests) {
        // Migration for existing data if any
        this._state = { ...s, tests: [] };
        return this._state;
    }
    return s;
  }
  async addTest(test: Test): Promise<User> {
    return this.mutate(state => ({
      ...state,
      tests: [...state.tests, test]
    }));
  }
  async toggleSession(testId: string, sessionId: string): Promise<User> {
    return this.mutate(state => {
      const testIndex = state.tests.findIndex(t => t.id === testId);
      if (testIndex === -1) return state;
      const updatedTests = [...state.tests];
      const test = { ...updatedTests[testIndex] };
      const sessionIndex = test.sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex === -1) return state;
      const updatedSessions = [...test.sessions];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        isCompleted: !updatedSessions[sessionIndex].isCompleted
      };
      test.sessions = updatedSessions;
      updatedTests[testIndex] = test;
      return { ...state, tests: updatedTests };
    });
  }
  async deleteTest(testId: string): Promise<User> {
      return this.mutate(state => ({
          ...state,
          tests: state.tests.filter(t => t.id !== testId)
      }));
  }
}