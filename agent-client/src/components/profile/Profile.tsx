import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Administrator',
    joinDate: new Date().toLocaleDateString(),
    location: 'New York, USA',
    bio: 'AI enthusiast and technology advocate'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
      <Card>
        <Box
          sx={{
            height: 200,
            backgroundColor: 'primary.main',
            position: 'relative'
          }}
        />
        <CardContent sx={{ position: 'relative', mt: -8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                backgroundColor: 'secondary.main'
              }}
            >
              {formData.name.charAt(0)}
            </Avatar>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ height: 36 }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                />
              ) : (
                <Typography variant="h5" gutterBottom>
                  {formData.name}
                </Typography>
              )}
              
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  margin="normal"
                />
              ) : (
                <Typography color="textSecondary" gutterBottom>
                  {formData.email}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Role
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.role}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Join Date
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.joinDate}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Location
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  margin="normal"
                />
              ) : (
                <Typography variant="body1" gutterBottom>
                  {formData.location}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Bio
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  margin="normal"
                />
              ) : (
                <Typography variant="body1" paragraph>
                  {formData.bio}
                </Typography>
              )}
            </Grid>

            {isEditing && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="contained" onClick={handleSave}>
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 