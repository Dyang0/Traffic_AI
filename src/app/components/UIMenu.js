import { React, useState, useEffect } from "react";
import {
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function UIMenu() {
  const [drawerOpen, setDrawerOpen] = useState(false); // State for controlling drawer
  const router = useRouter();

  function handleRouter(route) {
    // if (!isAdmin) {
    //     alert('Access denied: Admins only.');
    //     return;
    // }
    router.push(route); // Route to the desired page
    setDrawerOpen(false); // Close the drawer after navigation
  }

  function handleLogout() {
    // Clear the authentication token and redirect to login page
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  }

  // return (
  //     <Box>
  //         <DrawerMenu drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} handleRouter={handleRouter}></DrawerMenu>
  //         <UIAppBar setDrawerOpen={setDrawerOpen} handleLogout={handleLogout}></UIAppBar>
  //     </Box>
  // )
  return (
    <Box>
      <DrawerMenu
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        handleRouter={handleRouter}
      />
      <UIAppBar
        setDrawerOpen={setDrawerOpen}
        handleLogout={handleLogout}
        handleRouter={handleRouter}
      />
    </Box>
  );
}

// App Bar at top of page
function UIAppBar(props) {
  const [role, setRole] = useState(""); // Default to non-admin
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${document.cookie.replace("token=", "")}`,
          },
        });
        const data = await response.json();
        setRole(data.role);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  if (role == "admin") {
    return (
      <AppBar>
        <Toolbar>
          <IconButton onClick={() => props.setDrawerOpen(true)}>
            {" "}
            {/* Toggle the drawer on click */}
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Button
              key="home"
              onClick={() => {
                props.handleRouter("/home");
              }}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              HOME
            </Button>
          </Box>
          <UserMenu handleLogout={props.handleLogout}></UserMenu>
        </Toolbar>
      </AppBar>
    );
  } else if (role == "user") {
    return (
      <AppBar>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Button
              onClick={() => {
                props.handleRouter("/home");
              }}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              HOME
            </Button>
          </Box>
          <UserMenu handleLogout={props.handleLogout}></UserMenu>
        </Toolbar>
      </AppBar>
    );
  }
}

// User Account Menu on AppBar
function UserMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <Box>
      <Button variant="contained" onClick={handleClick}>
        User
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{ justifyContent: "flex-end" }}
      >
        {/* Remove or comment out the "My account" MenuItem */}
        {/*
                <MenuItem 
                    onClick={() => {
                        handleClose()
                    }}
                >
                    My account
                </MenuItem>
                */}
        <MenuItem
          onClick={() => {
            props.handleLogout();
            handleClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Navigation Menu for User to navigate to other pages
function DrawerMenu(props) {
  const [manageModelsOpen, setManageModelsOpen] = useState(false); // State to control the collapse

  return (
    <Drawer
      anchor="left"
      open={props.drawerOpen}
      onClose={() => props.setDrawerOpen(false)} // Close the drawer
    >
      <ListItem></ListItem> {/*Extra spacing*/}
      {/*Home Navigation Button*/}
      <ListItem
        button
        onClick={() => {
          props.handleRouter("/home");
        }}
      >
        <Typography>Home</Typography>
      </ListItem>
      <List>
        {/* Manage Models item with expand/collapse toggle */}
        <ListItem button onClick={() => setManageModelsOpen(!manageModelsOpen)}>
          <ListItemText primary="Manage Models" />
          {manageModelsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>

        {/* Nested options for Manage Models */}
        <Collapse in={manageModelsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              onClick={() => {
                props.handleRouter("/managemodel");
              }}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Model List" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                props.handleRouter("/newmodel");
              }}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Add Model" />
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}

