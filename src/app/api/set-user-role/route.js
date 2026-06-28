import { MongoClient } from "mongodb";

let db;
function getDb() {
  if (!db) {
    const client = new MongoClient(process.env.MONGODB_URI);
    db = client.db(process.env.DB_NAME);
  }
  return db;
}

export async function POST(req) {
  try {
    const { email, role, plan } = await req.json();
    const database = getDb();

    await database.collection("user").updateOne(
      { email },
      { $set: { role, plan } }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[set-user-role]", err);
    return Response.json({ error: "Failed to update role" }, { status: 500 });
  }
}