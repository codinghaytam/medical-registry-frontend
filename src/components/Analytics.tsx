import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Sample data for charts
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'This Year',
        data: [12, 19, 13, 15, 20, 25, 22, 30, 28, 25, 24, 30],
        fill: false,
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
      {
        label: 'Last Year',
        data: [8, 15, 9, 12, 17, 19, 16, 25, 22, 19, 20, 25],
        fill: false,
        borderColor: theme.palette.grey[400],
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue',
        data: [65, 59, 80, 81],
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: 'Expenses',
        data: [45, 40, 55, 60],
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          borderDash: [2, 4],
          drawBorder: false,
        },
      },
    },
  };

  // Sample data for top products table
  const topProducts = [
    { id: 1, name: 'Premium Plan', sales: 452, revenue: '$12,500', growth: 12.5 },
    { id: 2, name: 'Basic Plan', sales: 785, revenue: '$8,250', growth: 8.3 },
    { id: 3, name: 'Enterprise Solution', sales: 124, revenue: '$24,800', growth: 22.1 },
    { id: 4, name: 'Custom Development', sales: 98, revenue: '$18,300', growth: -5.2 },
    { id: 5, name: 'Maintenance Package', sales: 321, revenue: '$6,400', growth: 15.7 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Analytics
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Download size={18} />}
          sx={{ borderRadius: 2 }}
        >
          Export Report
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    $124,532
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={16} color={theme.palette.success.main} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +18.2% from last year
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.light + '20', p: 1 }}>
                  <BarChart3 size={24} color={theme.palette.primary.main} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    3.42%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowDownRight size={16} color={theme.palette.error.main} />
                    <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                      -0.5% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.secondary.light + '20', p: 1 }}>
                  <TrendingUp size={24} color={theme.palette.secondary.main} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Users
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    12,849
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={16} color={theme.palette.success.main} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +9.3% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.light + '20', p: 1 }}>
                  <Users size={24} color={theme.palette.info.main} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Revenue Trends</Typography>
                <Box>
                  <Tabs value={tabValue} onChange={handleTabChange} sx={{ minHeight: 0 }}>
                    <Tab label="Annual" sx={{ minHeight: 0, px: 2 }} />
                    <Tab label="Monthly" sx={{ minHeight: 0, px: 2 }} />
                    <Tab label="Weekly" sx={{ minHeight: 0, px: 2 }} />
                  </Tabs>
                </Box>
              </Box>
              <Box sx={{ height: 350 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Top Products</Typography>
                <IconButton size="small">
                  <MoreVertical size={18} />
                </IconButton>
              </Box>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {product.name}
                        </TableCell>
                        <TableCell align="right">{product.sales}</TableCell>
                        <TableCell align="right">{product.revenue}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${product.growth > 0 ? '+' : ''}${product.growth}%`}
                            size="small"
                            color={product.growth > 0 ? 'success' : 'error'}
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: product.growth > 0 
                                ? theme.palette.success.light + '30'
                                : theme.palette.error.light + '30',
                              color: product.growth > 0 
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Quarterly Comparison</Typography>
                <IconButton size="small">
                  <MoreVertical size={18} />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;