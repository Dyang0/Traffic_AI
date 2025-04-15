// src/app/trainmodel/page.js
"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";

import UIMenu from "../components/UIMenu"; // Adjust path as needed

import axios from "axios";

export default function NewModelPage() {
  const [modelName, setModelName] = useState("");
  const [epochVal, setEpochVal] = useState("");
  const [kfoldVal, setKfoldVal] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modelOutput, setModelOutput] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [inputType, setInputType] = useState("csv");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user data.");
        const data = await res.json();
        setUserId(data.userId);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, []);

  const getCookie = (name) => {
    if (typeof window === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTrain = async () => {
    if (!modelName.trim()) {
      setError("Model name is required.");
      return;
    }

    if (inputType === "csv" && !file) {
      setError("CSV file is required.");
      return;
    }

    const epoch = Number(epochVal.trim());
    const kfold = Number(kfoldVal.trim());

    if (!Number.isInteger(epoch) || epoch < 1) {
      setError("Epoch value must be an integer >= 1");
      return;
    }

    if (!Number.isInteger(kfold) || kfold < 1) {
      setError("K-Fold value must be an integer >= 1.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const token = getCookie("token");
      if (!token) throw new Error("User not authenticated. Please log in.");

      setModelOutput(null);
      const formData = new FormData();
      formData.append("csv", file);
      formData.append("epoch", epochVal);
      formData.append("kfold", kfoldVal);

      const response = await fetch("/api/train", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      setModelOutput(data);
    } catch (err) {
      console.error("Error during training:", err);
      setError(err.message || "Training failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      //downloads the model (named dnnmodel.keras under FastAPI). dnnmodel.keras represents the most recent trained model
      const fastApiDownloadUrl = process.env.ML_API_URL
        ? `${process.env.ML_API_URL}/download_model`
        : "http://127.0.0.1:8000/download_model";

      const response = await axios.get(fastApiDownloadUrl, {
        responseType: "blob",
        timeout: 15000,
      });

      const modelBlob = response.data;

      const modelFile = new File([modelBlob], `${modelName}.keras`, {
        type: "application/octet-stream",
      });

      const formData2 = new FormData();
      formData2.append("name", modelName);
      formData2.append(
        "inputFields",
        JSON.stringify([
          "CountStation",
          "Weaving",
          "Lanes",
          "Curvature(degrees/100feet)",
          "CalLength(meters)",
          "CAR_SPEED_",
          "ADT",
        ]),
      );
      formData2.append("userId", userId);
      formData2.append("modelFile", modelFile);

      const response2 = await fetch("/api/models", {
        method: "POST",
        body: formData2,
      });

      if (!response2.ok) {
        const errorData = await response2.json();
        throw new Error(errorData.error || "Model upload failed.");
      }

      const responseData = await response2.json();
      console.log("Model uploaded successfully:", responseData);

      setConfirmationMessage("✅ Model uploaded and saved successfully!");

      setModelOutput(null); // Hide output to encourage retry
    } catch (err) {
      console.error("Error uploading model:", err);
      setError(err.message || "Model save failed.");
    }
  };

  const handleReject = () => {
    setConfirmationMessage("❌ Model rejected. Please try training again.");
    setModelOutput(null); // Hide output to encourage retry
  };

  return (
    <Box sx={{ padding: 4 }}>
      <UIMenu />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: 4,
          marginTop: 10,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ marginBottom: 4 }}>
          Train Model
        </Typography>

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            Enter Model Name
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Enter a model name"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            marginTop: 4,
            maxWidth: 400,
          }}
        >
          <TextField
            label="Upload CSV"
            variant="outlined"
            type="file"
            onChange={handleFileChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />

          <TextField
            label="Enter Epoch Value"
            variant="outlined"
            fullWidth
            value={epochVal}
            onChange={(e) => setEpochVal(e.target.value)}
            placeholder="Choose an integer >= 1"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Enter K-Fold Value"
            variant="outlined"
            fullWidth
            value={kfoldVal}
            onChange={(e) => setKfoldVal(e.target.value)}
            placeholder="Choose an integer >= 1"
            InputLabelProps={{ shrink: true }}
          />

          {error && (
            <Typography
              variant="body1"
              color="error"
              align="center"
              sx={{ marginTop: 2 }}
            >
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleTrain}
            disabled={loading}
            sx={{ marginTop: 2 }}
          >
            {loading ? "Training..." : "Train"}
          </Button>

          {modelOutput && (
            <Box sx={{ mt: 4, width: "100%", maxWidth: 600 }}>
              <Typography variant="h6">Training Results</Typography>
              <pre>{JSON.stringify(modelOutput, null, 2)}</pre>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleAccept}
                >
                  Accept
                </Button>
                <Button variant="outlined" color="error" onClick={handleReject}>
                  Don't Accept
                </Button>
              </Box>
            </Box>
          )}

          {confirmationMessage && (
            <Typography sx={{ mt: 2 }}>{confirmationMessage}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
