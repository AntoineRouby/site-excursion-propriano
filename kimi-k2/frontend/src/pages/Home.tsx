import React from 'react';
import { Container, Grid, Typography, Button, Card, CardMedia, CardContent, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { excursionService } from '../services/excursion.service';
import Hero from '../components/Hero';
import ReviewCarousel from '../components/ReviewCarousel';
import BookingWidget from '../components/BookingWidget';
import FeatureGrid from '../components/FeatureGrid';

const Home: React.FC = () => {
  const { data: excursions, isLoading } = useQuery('excursions', () => 
    excursionService.getFeaturedExcursions()
  );

  return (
    <>
      <Hero />
      
      {/* Featured Excursions */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" gutterBottom>
            Nos Excursions Incontournables
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Découvrez les merveilles de la Corse lors d'excursions uniques
          </Typography>
          
          <Grid container spacing={4}>
            {excursions?.map((excursion) => (
              <Grid item xs={12} md={4} key={excursion._id}>
                <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={excursion.images[0]}
                    alt={excursion.name.fr}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {excursion.name.fr}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {excursion.shortDescription.fr}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="h6" color="primary">
                        {excursion.price}€ / pers.
                      </Typography>
                      <Button 
                        component={Link} 
                        to={`/excursions/${excursion._id}`}
                        variant="contained"
                        size="small"
                      >
                        Découvrir
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Booking Widget */}
      <BookingWidget />

      {/* Reviews */}
      <ReviewCarousel />

      {/* Features */}
      <FeatureGrid />
    </>
  );
};

export default Home;