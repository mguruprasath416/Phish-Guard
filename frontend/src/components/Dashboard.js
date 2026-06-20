import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import { WarningAmber, CheckCircle, Error } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [simulations, setSimulations] = useState([]);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        fetchSimulations();
    }, []);

    const fetchSimulations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/simulations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSimulations(response.data);
        } catch (err) {
            console.error('Error fetching simulations:', err);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/analyze',
                { sender: email, subject, body },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResult(response.data);
            await fetchSimulations(); // Refresh simulations list
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSimulation = async () => {
        try {
            await axios.post(
                'http://localhost:5000/api/simulations',
                {
                    sender: email,
                    subject,
                    body,
                    isPhishing: result?.isPhishing || false
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchSimulations();
            setEmail('');
            setSubject('');
            setBody('');
            setResult(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create simulation');
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WarningAmber color="warning" /> Phishing Simulation Tool
                </Typography>

                {/* Analysis Form */}
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <form onSubmit={handleAnalyze}>
                        <TextField
                            fullWidth
                            label="Sender Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email Body"
                            multiline
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            margin="normal"
                            required
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Analyze Email'}
                        </Button>
                    </form>
                </Paper>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {/* Analysis Results */}
                {result && (
                    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {result.isPhishing ? (
                                <Error color="error" />
                            ) : (
                                <CheckCircle color="success" />
                            )}
                            Analysis Results
                        </Typography>

                        <Alert
                            severity={result.isPhishing ? 'error' : 'success'}
                            sx={{ mb: 3 }}
                            variant="filled"
                        >
                            {result.isPhishing ? 'Potential Phishing Detected!' : 'No Phishing Indicators Found'}
                        </Alert>

                        {/* Indicators */}
                        {result.indicators.length > 0 && (
                            <Card sx={{ mb: 3, bgcolor: 'error.50' }}>
                                <CardContent>
                                    <Typography variant="h6" color="error" gutterBottom>
                                        Phishing Indicators
                                    </Typography>
                                    <List>
                                        {result.indicators.map((indicator, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={indicator} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detailed Analysis */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Detailed Analysis
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary="Sender Analysis"
                                            secondary={result.analysis.sender.reason}
                                        />
                                        <Chip
                                            color={result.analysis.sender.suspicious ? 'error' : 'success'}
                                            label={result.analysis.sender.suspicious ? 'Suspicious' : 'Safe'}
                                        />
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Subject Analysis"
                                            secondary={result.analysis.subject.reason}
                                        />
                                        <Chip
                                            color={result.analysis.subject.suspicious ? 'error' : 'success'}
                                            label={result.analysis.subject.suspicious ? 'Suspicious' : 'Safe'}
                                        />
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Content Analysis"
                                            secondary={result.analysis.body.reason}
                                        />
                                        <Chip
                                            color={result.analysis.body.suspicious ? 'error' : 'success'}
                                            label={result.analysis.body.suspicious ? 'Suspicious' : 'Safe'}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>

                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            onClick={handleCreateSimulation}
                            sx={{ mt: 2 }}
                        >
                            Save as Simulation
                        </Button>
                    </Paper>
                )}

                {/* Simulations History */}
                {simulations.length > 0 && (
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Recent Simulations
                        </Typography>
                        <List>
                            {simulations.map((simulation) => (
                                <React.Fragment key={simulation._id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={simulation.subject}
                                            secondary={`From: ${simulation.sender} | ${new Date(simulation.createdAt).toLocaleString()}`}
                                        />
                                        <Chip
                                            color={simulation.isPhishing ? 'error' : 'success'}
                                            label={simulation.isPhishing ? 'Phishing' : 'Safe'}
                                            sx={{ ml: 2 }}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default Dashboard;
