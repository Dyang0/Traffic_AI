"use client";
import { useRouter } from "next/navigation";
import { React, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SideInfo from "../components/SideInfo";
// import UserForm from "../components/UserForm";

import styles from "../styles/login.module.css";
import TextField from "@mui/material/TextField";

export default function Signup() {
  return (
    <Box className={styles.loginPage}>
      <SideInfo />
      <SignupForm />
    </Box>
  );
}

function SignupForm() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };
  const handleMouseDownPassword = (event) => {
    // Prevent the default action of focusing/firing blur
    event.preventDefault();
  };

  // Send credentials to backend for authorization
  async function register() {
    setError();

    if (userInput === "") {
      setError("Please Enter a Username");
      return;
    } else if (passInput === "") {
      setError("Please Enter a Password");
      return;
    } else if (passInput != confirm) {
      setError("Passwords did not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userInput,
          password: passInput,
        }),
      });

      const data = await res.json();
      if (res.status === 400) {
        setError("Username Already Taken");
      } else if (res.status === 500) {
        setError("Internal Server Error :(");
      } else if (res.ok) {
        // Set the JWT token as a cookie
        document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;
        // Redirect to Home
        router.push("/home");
      }
    } catch (e) {
      console.error(e);
      setError("Error during signup");
    }
  }

  function signin() {
    router.push(`/login`);
  }

  return (
    <Box className={styles.loginFormContainer}>
      <Box
        component="form"
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          register();
        }}
      >
        <Typography variant="h4" className={styles.title}>
          Sign Up
        </Typography>
        <TextField
          required
          id="user"
          label="Username"
          fieldLabel="Username"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <TextField
          required
          id="password"
          label="Password"
          fieldLabel="Password"
          type={showPassword ? "text" : "password"}
          value={passInput}
          onChange={(e) => setPassInput(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          required
          id="confirmPassword"
          label="Confirm Password"
          fieldLabel="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassInput}
          onChange={(e) => setConfirmPassInput(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && (
          <Typography variant="caption" className={styles.error}>
            {error}
          </Typography>
        )}
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
          }
          label={<Typography variant="subtitle2">Remember Me</Typography>}
        />
        <Button variant="contained" color="primary" type="submit">
          Create an Account
        </Button>
        <Box className={styles.noAccount}>
          <Typography variant="caption">{`Already have an account?`}</Typography>
          <Button
            variant="text"
            size="small"
            onClick={(e) => {
              e.preventDefault();
              signin();
            }}
          >
            <Typography variant="caption">Sign In</Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
