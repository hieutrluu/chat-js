import pgInit from 'pg-promise';
import { FrappeApp } from "frappe-js-sdk";

const frappe = new FrappeApp("https://localhost:8000", {
    useToken: true,
    // Pass a custom function that returns the token as a string - this could be fetched from LocalStorage or auth providers like Firebase, Auth0 etc.
    token: getTokenFromLocalStorage(),
    // This can be "Bearer" or "token"
    type: "Bearer"
})

// const pgp = pgInit();
// export const db = pgp("postgresql://pgvectortest:123@pgvector:5432/pgvectortest");

// const {isolationLevel} = pgp.txMode;

// Helper to make sure we always access database at serializable level.
export async function tx(f) {
  frappe.db.sql("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
  return await frappe.db(f);
}

// Replace using pg-promise (working directly with the database) to working with the frappe-js-sdk or frappe-react-sdk