import { connectDB } from "../../lib/mongodb";

export async function GET({ params, request }) {
  try {
    const db = await connectDB();
    const products = await db.collection("catalog").find({}).toArray();

    return new Response(
      JSON.stringify({
        success: true,
        count: products.length,
        data: products,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
