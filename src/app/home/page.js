"use client";

//colors:
//maroon: 861F41
//orange: C95B0C

import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CollectionsIcon from "@mui/icons-material/Collections";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import styles from "../styles/Home.module.css";

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Typography,
  Button,
  TextField,
  Divider,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Card,
  CardContent,
  Grid,
  Menu,
  CircularProgress,
  Chip,
} from "@mui/material";

export default function Home() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const userResponse = await fetch("/api/auth/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!userResponse.ok) {
          throw new Error("Failed to authenticate user");
        }

        const userData = await userResponse.json();
        const userId = userData.userId;
        if (!userId) {
          throw new Error("User ID not found");
        }

        const response = await fetch(`/api/collections?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Collections API error response:", errorText);
          throw new Error(`Failed to fetch collections: ${response.status}`);
        }

        const data = await response.json();
        console.log("Collections data:", data);
        setCollections(data || []);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError(err.message || "Failed to fetch collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  //getting the name of the cookie
  const getCookie = (name) => {
    if (typeof document === "undefined") {
      return null;
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  };

  const handleCreateCollection = () => {
    router.push("/newcollection");
  };

  const handleViewPredictions = (collectionId) => {
    router.push(`/reports_page/${collectionId}`);
  };

  const handleAddPrediction = (collectionId) => {
    router.push(`/input_page/${collectionId}`);
  };

  const handleDeleteCollection = async (collectionId, collectionName) => {
    if (
      !confirm(
        `Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete collection");
      }

      setCollections(
        collections.filter((collection) => collection._id !== collectionId),
      );
    } catch (err) {
      console.error("Error deleting collection:", err);
      alert(`Error: ${err.message || "Failed to delete collection"}`);
    }
  };

  return (
    <Box className={styles.app}>
      <UIAppBar />
      <Container maxWidth="lg" className={styles.mainContainer}>
        <UICollections
          collections={collections}
          loading={loading}
          error={error}
          onCreateCollection={handleCreateCollection}
          onViewPredictions={handleViewPredictions}
          onAddPrediction={handleAddPrediction}
          onDeleteCollection={handleDeleteCollection}
        />

        <Divider sx={{ my: 4 }} />
        <UIUserLog />
      </Container>
    </Box>
  );
}

function UIAppBar() {
  const [username, setUsername] = useState("User");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mainMenuAnchor, setMainMenuAnchor] = useState(null);
  const router = useRouter ? useRouter() : { push: () => {} };

  // Fetch user info on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const data = await res.json();
        setUser({
          userId: data.userId,
          username: data.username,
          role: data.role,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  const handleMainMenuOpen = (event) => {
    setMainMenuAnchor(event.currentTarget);
  };
  const handleMainMenuClose = () => {
    setMainMenuAnchor(null);
  };
  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
    handleUserMenuClose();
  };
  const navigateToAddModel = () => {
    router.push("/newmodel");
    handleMainMenuClose();
  };
  const navigateToModelsList = () => {
    router.push("/managemodel");
    handleMainMenuClose();
  };

  const navigateToTrainModel = () => {
    router.push("/trainmodel");
    handleMainMenuClose();
  };
  return (
    <AppBar position="fixed" elevation={3} sx={{ backgroundColor: "#861F41" }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMainMenuOpen}
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
          onClick={handleUserMenuOpen}
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

        {/*Top right user menu*/}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          sx={{ mt: 1 }}
        >
          {user && user.role === "admin" && (
            <MenuItem
              onClick={() => {
                router.push("/admin");
                handleUserMenuClose();
              }}
              sx={{
                color: "#1a237e",
                fontWeight: 500,
              }}
            >
              <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 20 }} />
              Admin Control Panel
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>

        {/*Navigation Menu Bar*/}
        <Menu
          anchorEl={mainMenuAnchor}
          open={Boolean(mainMenuAnchor)}
          onClose={handleMainMenuClose}
          sx={{ mt: 1 }}
        >
          <MenuItem onClick={navigateToAddModel}>Add New Model</MenuItem>
          <MenuItem onClick={navigateToModelsList}>View All Models</MenuItem>
          <MenuItem onClick={navigateToTrainModel}>Train Model</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

function UICollections({
  collections,
  loading,
  error,
  onCreateCollection,
  onViewPredictions,
  onAddPrediction,
  onDeleteCollection,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card
      elevation={3}
      sx={{
        mt: 10,
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              color: "#861F41", //my collections text color
              mb: 0,
            }}
          >
            <CollectionsIcon sx={{ mr: 1 }} /> My Collections
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={onCreateCollection}
            sx={{
              borderRadius: 2,
              backgroundColor: "#861F41", //new collection color
              "&:hover": {
                backgroundColor: "#861F41",
              },
            }}
          >
            New Collection
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              p: 3,
              backgroundColor: "#ffebee",
              borderRadius: 2,
              border: "1px solid #ffcdd2",
              my: 2,
            }}
          >
            <Typography color="error" gutterBottom>
              Error: {error}
            </Typography>
            <Typography variant="body2">
              Try refreshing the page or logging out and back in.
            </Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={onCreateCollection}
              >
                Try Creating a Collection Anyway
              </Button>
            </Box>
          </Box>
        ) : collections.length === 0 ? (
          <Card
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h6" color="textSecondary">
                You don't have any collections
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                Collections help you organize your predictions
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddCircleIcon />}
                onClick={onCreateCollection}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "#861F41", //create first collection button
                  "&:hover": {
                    backgroundColor: "#861F41",
                  },
                }}
              >
                Create Collection
              </Button>
            </Box>
          </Card>
        ) : (
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Collection Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Created Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Predictions
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow
                    key={collection._id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "#f5f5f5",
                      },
                      "&:hover": {
                        backgroundColor: "#e8eaf6",
                      },
                    }}
                  >
                    <TableCell>{collection.collectionName}</TableCell>
                    <TableCell>{formatDate(collection.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          collection.predictions
                            ? collection.predictions.length
                            : 0
                        }
                        color={
                          collection.predictions &&
                          collection.predictions.length > 0
                            ? "primary"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => onViewPredictions(collection._id)}
                          sx={{ borderRadius: 2 }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => onAddPrediction(collection._id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Add
                        </Button>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() =>
                            onDeleteCollection(
                              collection._id,
                              collection.collectionName,
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

function UIUserLog() {
  const [userLog, setUserLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearingLogs, setClearingLogs] = useState(false);

  const fetchLog = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching logs...");
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/log?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Backend Error - ${res.status}`);
      }
      const result = await res.json();
      console.log("Logs fetched:", result);

      if (Array.isArray(result.log)) {
        setUserLog(result.log);
        console.log(`Retrieved ${result.log.length} log entries`);
      } else {
        console.error("Invalid log data format:", result);
        setError("Invalid data format received from server");
        setUserLog([]);
      }
    } catch (error) {
      console.error("Error fetching user log:", error);
      setError(`Failed to fetch logs: ${error.message}`);
      setUserLog([]);
    } finally {
      setLoading(false);
    }
  };
  //signaled when clear log button is pressed, clears activities
  const clearLogs = async () => {
    if (!confirm("Confirm action to clear all activity logs?")) {
      return;
    }
    setClearingLogs(true);
    setError(null);
    try {
      const res = await fetch("/api/log", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to clear logs - ${res.status}`);
      }

      await fetchLog();
    } catch (error) {
      console.error("Error clearing logs:", error);
      setError(`Failed to clear logs: ${error.message}`);
    } finally {
      setClearingLogs(false);
    }
  };

  useEffect(() => {
    console.log("UIUserLog component mounted - fetching initial logs");
    fetchLog();
    const intervalId = setInterval(fetchLog, 15000);

    const handleRefreshEvent = () => {
      console.log("Received refreshActivityLog event - refreshing logs");
      fetchLog();
    };

    const handleForceRefreshEvent = () => {
      console.log("Received forceRefreshLog event - force refreshing logs");
      fetchLog();
    };
    window.addEventListener("refreshActivityLog", handleRefreshEvent);
    window.addEventListener("forceRefreshLog", handleForceRefreshEvent);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("refreshActivityLog", handleRefreshEvent);
      window.removeEventListener("forceRefreshLog", handleForceRefreshEvent);
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  return (
    <Card
      elevation={3}
      sx={{ borderRadius: 2, overflow: "hidden" }}
      data-component="user-log"
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 3,
            backgroundColor: "#861F41", //user activity log color
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            User Activity Log
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={clearLogs}
              disabled={loading || clearingLogs}
              sx={{
                borderRadius: 2,
                backgroundColor: "#C95B0C", //clear log color
                color: "white",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
                textTransform: "none",
              }}
            >
              {clearingLogs ? "Clearing..." : "Clear Log"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={fetchLog}
              disabled={loading}
              sx={{
                borderRadius: 2,
                backgroundColor: "white",
                color: "#1a237e",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
                textTransform: "none",
              }}
            >
              {loading ? "Refreshing..." : "Refresh Log"}
            </Button>
          </Box>
        </Box>

        {/*display errors*/}
        {error && (
          <Box
            sx={{
              p: 2,
              backgroundColor: "#ffebee",
              borderColor: "#ffcdd2",
              borderStyle: "solid",
              borderWidth: 1,
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Timestamp
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Model
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Input Source
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#e8eaf6" }}
                  >
                    Predictions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userLog.length > 0 ? (
                  userLog.map((log, index) => (
                    <TableRow
                      key={log._id || index}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "#f5f5f5",
                        },
                        "&:hover": {
                          backgroundColor: "#e8eaf6",
                        },
                      }}
                    >
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>{log.modelName}</TableCell>
                      <TableCell>{log.inputSource}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.predictionsCount}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        No activity logged yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

