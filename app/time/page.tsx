'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeRemaining = (): TimeRemaining => {
  const targetDate = new Date('2025-06-05T10:00:00');
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  console.log('Fecha objetivo:', targetDate.toLocaleString());
  console.log('Fecha actual:', now.toLocaleString());
  console.log('Diferencia en milisegundos:', difference);

  if (difference <= 0) {
    console.log('La fecha objetivo ya ha pasado');
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  console.log('Tiempo calculado:', { days, hours, minutes, seconds });

  return { days, hours, minutes, seconds };
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <Box sx={{ textAlign: 'center', mx: 2 }}>
    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
      {value.toString().padStart(2, '0')}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default function TimePage() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const targetDate = new Date('2025-06-05T10:00:00');
  const isExpired = new Date() > targetDate;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 3
    }}>
      <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4 }}>
            {isExpired ? '¡El evento ha comenzado!' : 'Tiempo restante hasta el evento'}
          </Typography>
          
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Jueves 5 de Junio, 2025 - 10:00 AM
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            gap: 2
          }}>
            <TimeUnit value={timeRemaining.days} label="Días" />
            <TimeUnit value={timeRemaining.hours} label="Horas" />
            <TimeUnit value={timeRemaining.minutes} label="Minutos" />
            <TimeUnit value={timeRemaining.seconds} label="Segundos" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}