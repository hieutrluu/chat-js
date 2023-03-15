import pgInit from 'pg-promise';

const pgp = pgInit();
export const db = pgp("postgresql://pgvectortest:123@pgvector:5432/pgvectortest");

const {isolationLevel} = pgp.txMode;

// Helper to make sure we always access database at serializable level.
export async function tx(f) {
  return await db.tx({mode: isolationLevel.serializable}, f);
}