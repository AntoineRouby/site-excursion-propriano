import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { 
  TrendingUp, 
  People, 
  CalendarToday, 
  Euro,
  CheckCircle,
  Cancel,
  Visibility,
  Print,
  Email,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { Line, Doughnut } from 'react-chartjs-2';
import { adminService } from '../services/admin.service';
import { reservationService } from '../services/reservation.service';

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInDialog, setCheckInDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Fetch dashboard data
  const { data: stats } = useQuery(['dashboard-stats', selectedDate], () => 
    adminService.getDashboardStats(selectedDate)
  );

  const { data: todayReservations } = useQuery(['today-reservations', selectedDate], () => 
    reservationService.getReservationsByDate(selectedDate)
  );

  const { data: recentActivity } = useQuery('recent-activity', () => 
    adminService.getRecentActivity()
  );

  const handleCheckIn = async (reservationId: string) => {
    try {
      await reservationService.checkIn(reservationId);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const revenueChartData = {
    labels: stats?.revenueChart.map((item: any) => item.label) || [],
    datasets: [
      {
        label: 'Chiffre d\'affaires',
        data: stats?.revenueChart.map((item: any) => item.value) || [],
        borderColor: '#0077b6',
        backgroundColor: 'rgba(0, 119, 182, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const excursionChartData = {
    labels: stats?.excursionDistribution.map((item: any) => item.name) || [],
    datasets: [
      {
        data: stats?.excursionDistribution.map((item: any) => item.count) || [],
        backgroundColor: ['#0077b6', '#48cae4', '#023e8a', '#00b4d8'],
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Aperçu de l'activité du jour
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Chiffre d'affaires du jour
                  </Typography>
                  <Typography variant="h4">
                    {stats?.todayRevenue || 0}€
                  </Typography>
                </Box>
                <Euro sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  vs hier: {stats?.revenueChange || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.abs(stats?.revenueChange || 0)} 
                  color={stats?.revenueChange > 0 ? 'success' : 'error'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Réservations du jour
                  </Typography>
                  <Typography variant="h4">
                    {stats?.todayReservations || 0}
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {stats?.confirmedReservations || 0} confirmées
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Taux d'occupation
                  </Typography>
                  <Typography variant="h4">
                    {stats?.occupancyRate || 0}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {stats?.totalCapacity || 0} places disponibles
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Clients attendus
                  </Typography>
                  <Typography variant="h4">
                    {stats?.expectedClients || 0}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {stats?.newClients || 0} nouveaux clients
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Check-in List */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Liste d'embarquement - {new Date(selectedDate).toLocaleDateString('fr-FR')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={() => window.print()}
                >
                  Imprimer
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Réservation</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Excursion</TableCell>
                      <TableCell>Heure</TableCell>
                      <TableCell>Personnes</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayReservations?.map((reservation: any) => (
                      <TableRow key={reservation._id}>
                        <TableCell>{reservation.reservationNumber}</TableCell>
                        <TableCell>
                          {reservation.client.firstName} {reservation.client.lastName}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {reservation.client.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{reservation.excursion.name.fr}</TableCell>
                        <TableCell>{reservation.timeSlot}</TableCell>
                        <TableCell>{reservation.numberOfPeople}</TableCell>
                        <TableCell>
                          <Chip
                            label={reservation.status}
                            color={
                              reservation.status === 'confirmed' ? 'success' :
                              reservation.status === 'pending' ? 'warning' :
                              reservation.status === 'cancelled' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setCheckInDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                            {reservation.status === 'confirmed' && !reservation.checkInTime && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CheckCircle />}
                                onClick={() => handleCheckIn(reservation._id)}
                              >
                                Embarquer
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Revenue Chart */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenus des 7 derniers jours
              </Typography>
              <Box sx={{ height: 200 }}>
                <Line data={revenueChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>

          {/* Excursion Distribution */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition par excursion
              </Typography>
              <Box sx={{ height: 200 }}>
                <Doughnut data={excursionChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activité récente
          </Typography>
          <List>
            {recentActivity?.map((activity: any, index: number) => (
              <ListItem key={index} divider={index < recentActivity.length - 1}>
                <ListItemText
                  primary={activity.description}
                  secondary={new Date(activity.createdAt).toLocaleString('fr-FR')}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <Email />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={checkInDialog} onClose={() => setCheckInDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Détails de la réservation
        </DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Réservation n°: {selectedReservation.reservationNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Client: {selectedReservation.client.firstName} {selectedReservation.client.lastName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Excursion: {selectedReservation.excursion.name.fr}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Date: {new Date(selectedReservation.date).toLocaleDateString('fr-FR')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Heure: {selectedReservation.timeSlot}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Nombre de personnes: {selectedReservation.numberOfPeople}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Montant total: {selectedReservation.totalAmount}€
              </Typography>
              {selectedReservation.notes && (
                <Typography variant="body2" gutterBottom>
                  Notes: {selectedReservation.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInDialog(false)}>
            Fermer
          </Button>
          {selectedReservation?.status === 'confirmed' && !selectedReservation?.checkInTime && (
            <Button
              onClick={() => {
                handleCheckIn(selectedReservation._id);
                setCheckInDialog(false);
              }}
              variant="contained"
              startIcon={<CheckCircle />}
            >
              Confirmer l'embarquement
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;