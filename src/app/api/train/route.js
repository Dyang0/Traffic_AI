// src/app/api/train/route.js
import connectToDatabase from "@lib/mongodb";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Invalid Content-Type. Expected multipart/form-data.",
        }),
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const csvFile = formData.get("csv");
    const epochVal = formData.get("epoch");
    const kfoldVal = formData.get("kfold");

    if (!kfoldVal || !epochVal || !csvFile) {
      return new Response(
        JSON.stringify({
          error: "kfold, epoch, and csv file are required.",
        }),
        { status: 400 },
      );
    }

    if (!(csvFile instanceof File)) {
      return new Response(JSON.stringify({ error: "Invalid file upload." }), {
        status: 400,
      });
    }

    await connectToDatabase();

    // Create FormData to send to FastAPI
    const formToFastApi = new FormData();
    formToFastApi.append("file", csvFile);
    formToFastApi.append("epochs", epochVal);
    formToFastApi.append("kfolds", kfoldVal);

    const fastApiUrl = process.env.ML_API_URL
      ? `${process.env.ML_API_URL}/train_model`
      : "http://127.0.0.1:8000/train_model";
    console.log("Sending payload to FastAPI:", formToFastApi);

    const trainingResponse = await axios.post(fastApiUrl, formToFastApi, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 150000, //time limit for training of data (can change based on needs)
    });

    const { results } = trainingResponse.data;

    return new Response(
      JSON.stringify({
        result: results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error processing training request:", error);

    let status = 500;
    let errorMessage = "Internal Server Error";

    if (error.response) {
      status = error.response.status;
      errorMessage =
        error.response.data.detail ||
        error.response.data.error ||
        "Error from FastAPI.";
    } else if (error.request) {
      errorMessage = "No response from FastAPI.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ error: errorMessage }), { status });
  }
}
