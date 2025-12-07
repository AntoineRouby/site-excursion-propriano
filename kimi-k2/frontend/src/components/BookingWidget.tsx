import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  DatePicker,
  LocalizationProvider,
  AdapterDateFns,
  frLocale,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { excursionService } from '../services/excursion.service';
import { reservationService } from '../services/reservation.service';

interface BookingFormData {
  excursion: string;
  date: Date | null;
  timeSlot: string;
  numberOfPeople: number;
  options: {
    lunch: boolean;
    equipment: boolean;
  };
}

const BookingWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm<BookingFormData>({
    defaultValues: {
      excursion: '',
      date: null,
      timeSlot: '',
      numberOfPeople: 2,
      options: {
        lunch: false,
        equipment: false,
      },
    },
  });

  const { data: excursions } = useQuery('excursions', () => 
    excursionService.getActiveExcursions()
  );

  const selectedExcursion = watch('excursion');
  const selectedDate = watch('date');

  const onSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    try {
      // Check availability
      const isAvailable = await reservationService.checkAvailability({
        excursion: data.excursion,
        date: data.date!,
        timeSlot: data.timeSlot,
        numberOfPeople: data.numberOfPeople,
      });

      if (isAvailable.available) {
        // Redirect to booking page with pre-filled data
        navigate('/booking', {
          state: {
            excursion: data.excursion,
            date: data.date,
            timeSlot: data.timeSlot,
            numberOfPeople: data.numberOfPeople,
            options: data.options,
            price: isAvailable.totalPrice,
          },
        });
      } else {
        // Show alternative dates
        alert('Date non disponible. Voici des alternatives: ' + 
          isAvailable.alternatives?.join(', '));
      }
    } catch (error) {
      console.error('Booking check error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: 'primary.main', color: 'white' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom color="white">
          Réservez Votre Aventure
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
          Choisissez votre excursion, date et nombre de participants
        </Typography>

        <Card sx={{ maxWidth: 800, mx: 'auto', boxShadow: 8 }}>
          <CardContent sx={{ p: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Excursion *</InputLabel>
                      <Controller
                        name="excursion"
                        control={control}
                        rules={{ required: 'Veuillez sélectionner une excursion' }}
                        render={({ field }) => (
                          <Select {...field} label="Excursion *">
                            {excursions?.map((excursion) => (
                              <MenuItem key={excursion._id} value={excursion._id}>
                                {excursion.name.fr} - {excursion.price}€
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="date"
                      control={control}
                      rules={{ required: 'Veuillez sélectionner une date' }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Date souhaitée *"
                          minDate={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.date,
                              helperText: errors.date?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Créneau horaire</InputLabel>
                      <Controller
                        name="timeSlot"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Créneau horaire">
                            <MenuItem value="morning">Matin (9h00)</MenuItem>
                            <MenuItem value="afternoon">Après-midi (14h00)</MenuItem>
                            <MenuItem value="sunset">Coucher de soleil (18h00)</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Nombre de personnes</InputLabel>
                      <Controller
                        name="numberOfPeople"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Nombre de personnes">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                              <MenuItem key={num} value={num}>
                                {num} {num === 1 ? 'personne' : 'personnes'}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Controller
                        name="options.lunch"
                        control={control}
                        render={({ field }) => (
                          <Button
                            variant={field.value ? 'contained' : 'outlined'}
                            onClick={() => field.onChange(!field.value)}
                            sx={{ color: field.value ? 'white' : 'primary.main' }}
                          >
                            Déjeuner +25€
                          </Button>
                        )}
                      />
                      <Controller
                        name="options.equipment"
                        control={control}
                        render={({ field }) => (
                          <Button
                            variant={field.value ? 'contained' : 'outlined'}
                            onClick={() => field.onChange(!field.value)}
                            sx={{ color: field.value ? 'white' : 'primary.main' }}
                          >
                            Équipement +15€
                          </Button>
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isLoading}
                      sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                      {isLoading ? 'Vérification...' : 'Vérifier la disponibilité'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </LocalizationProvider>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BookingWidget;