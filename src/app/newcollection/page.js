"use client";

//colors:
//maroon: 861F41
//orange: C95B0C

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CollectionsIcon from "@mui/icons-material/Collections";
import SaveIcon from "@mui/icons-material/Save";
import MenuIcon from "@mui/icons-material/Menu";

import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";

export default function newPage() {
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mainMenuAnchor, setMainMenuAnchor] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ userId: data.userId, username: data.username });
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUserError(err);
        router.push("/login");
      } finally {
        setUserLoading(false);
      }
    };
    getUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!collectionName.trim()) {
      setError("Collection name required");
      return;
    }
    if (userLoading) {
      setError("User information still loading");
      return;
    }
    if (!user) {
      setError("User not authenticated");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          collectionName,
          userId: user.userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create collection.");
      }

      const { collectionId } = data;
      router.push(`/input_page/${collectionId}`);
    } catch (err) {
      console.error("Error creating collection:", err);
      setError(err.message || "Failed to create collection.");
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push("/");
  };

  const userMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const userMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const mainMenuOpen = (event) => {
    setMainMenuAnchor(event.currentTarget);
  };

  const mainMenuClose = () => {
    setMainMenuAnchor(null);
  };

  //for logout
  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
    userMenuClose();
  };

  // Navigation functions
  const goAddModel = () => {
    router.push("/newmodel");
    mainMenuClose();
  };

  const goModels = () => {
    router.push("/managemodels");
    mainMenuClose();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa", //page background color
      }}
    >
      {/*Appbar matching home page*/}
      <AppBar
        position="fixed"
        elevation={3}
        sx={{ backgroundColor: "#861F41" }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={mainMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            Crash Rate Prediction Dashboard
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={userMenuOpen}
            sx={{
              borderRadius: 2,
              backgroundColor: "white",
              color: "black",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {user ? user.username : "User"}
          </Button>

          {/*user menu*/}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={userMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={logout}>Logout</MenuItem>
          </Menu>

          {/*main menu*/}
          <Menu
            anchorEl={mainMenuAnchor}
            open={Boolean(mainMenuAnchor)}
            onClose={mainMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={goBack}>Home</MenuItem>
            <MenuItem onClick={goAddModel}>Add New Model</MenuItem>
            <MenuItem onClick={goModels}>View All Models</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "visible",
            position: "relative",
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "8px",
              backgroundColor: "#861F41", //accent card color
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <IconButton onClick={goBack} sx={{ mr: 2 }} aria-label="go back">
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  color: "#861F41", //create new collection
                }}
              >
                <CollectionsIcon sx={{ mr: 1 }} /> Create New Collection
              </Typography>
            </Box>

            {userLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
                <CircularProgress />
              </Box>
            ) : userError ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {userError.message || "Failed to fetch user information."}
              </Alert>
            ) : (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, color: "text.secondary" }}
                  >
                    Collections help you organize predictions for different
                    projects or datasets. Give your collection a descriptive
                    name to easily identify it later.
                  </Typography>
                </Box>

                <TextField
                  label="Collection Name"
                  variant="outlined"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder="e.g., Virginia I-81 Highway"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={userLoading || loading}
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      backgroundColor: "#C95B0C", //create collection color
                      "&:hover": {
                        backgroundColor: "#C95B0C",
                      },
                      textTransform: "none",
                    }}
                  >
                    {loading ? "Creating..." : "Create Collection"}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
