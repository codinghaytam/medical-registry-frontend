import { Button, TextField, Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import { fetch } from '@tauri-apps/plugin-http';
import { da } from 'date-fns/locale';
import { useState, FormEvent } from 'react';

type KeycloakResponse = {
  access_token: string;
  refresh_token: string;
  // ...other fields remain the same but aren't used directly
}


export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.persist();
    setLoading(true);  // Set loading to true when starting
    setError(null);

    console.log("=== SUBMIT STARTED ===");  // This should always log

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "password");
    urlencoded.append("client_id", "medical-registry");
    urlencoded.append("scope", "email");
    urlencoded.append("username", email);
    urlencoded.append("password", password);
    urlencoded.append("client_secret", "yMPWLw3KpQse36zns4HwHdS571Vz3z6W");

    console.log("About to fetch...");  // Log before fetch

    try {
      console.log("Fetch starting...");  // This should log
      const response = await fetch("http://localhost:9090/realms/myRealm/protocol/openid-connect/token", {
        method: "POST",
        headers: myHeaders,
        body: urlencoded.toString(),
        redirect: "follow" as RequestRedirect,
      });
      console.log("Fetch completed, status:", response.status);  // This should log if fetch completes

      if (!response.ok) {
        throw new Error(`Invalid credentials: ${response.status}`);
      }
      
      try {
        // Try with timeout to see if it's permanently hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Response text timeout after 5 seconds")), 100000);
        });
        
        // Race between the text() call and the timeout
        const rawText = await Promise.race([
          response.text(),
          timeoutPromise
        ]) as string;
        
        // Manually parse JSON
        const data = JSON.parse(rawText);
        
        // Now you can use the data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        const MedecinData=await (await fetch("http://localhost:3000/medecin/email/" + email,{method:"GET"})).json()
        localStorage.setItem("user",JSON.stringify(MedecinData))
        // Redirect or update app state here
        window.location.href="http://localhost:1420/"
      } catch (parseError) {
        console.error("Error in response handling:", parseError);
        setError("Failed to process server response");
      }
    } catch (err) {
      console.error("Request error:", err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
      console.log("=== SUBMIT ENDED ===");  // This should always log
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      py: 4
    }}>
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper'
      }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Sign in
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, height: 48 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>
        
      </Box>
    </Container>
  );
}

