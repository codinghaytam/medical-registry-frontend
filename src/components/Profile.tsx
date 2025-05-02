import React, { useEffect, useState } from 'react';
import { Card, Container, Typography, Avatar, Grid, Paper } from '@mui/material';

export const Profile: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }, []);

  if (!userData) return <Typography>Loading profile...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">

          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4" align="center" gutterBottom>
              {userData.user?.name}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1">Email</Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.user?.email}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1">Phone</Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.phone || "Not provided"}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1">Specialty</Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.profession || "Not provided"}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1">License Number</Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.licenseNumber || "Not provided"}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
