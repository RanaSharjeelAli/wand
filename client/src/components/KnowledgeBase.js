import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('http://localhost:5001/api/documents', {
        headers
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    if (files.length > 0) {
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('http://localhost:5001/api/documents/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadProgress(100);
        await fetchDocuments();
        setTimeout(() => {
          setUploadDialogOpen(false);
          setSelectedFiles([]);
          setUploadProgress(0);
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5001/api/documents/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:5001/api/documents/${docId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.4) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
              Knowledge Base
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload documents and search using natural language
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            component="label"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Upload Documents
            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ask a Question
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="e.g., What are our product return policies?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  sx={{ minWidth: '120px' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>
            </Paper>
          </motion.div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Paper sx={{ p: 3, mb: 3 }}>
                  {/* Confidence Score */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={searchResult.hasGaps ? <WarningIcon /> : <CheckIcon />}
                      label={`Confidence: ${(searchResult.confidence * 100).toFixed(0)}%`}
                      color={getConfidenceColor(searchResult.confidence)}
                      sx={{ mr: 2 }}
                    />
                    {searchResult.hasGaps && (
                      <Chip
                        icon={<InfoIcon />}
                        label="Knowledge Gaps Detected"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Answer */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Answer
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                    {searchResult.answer}
                  </Typography>

                  {/* Sources */}
                  {searchResult.sources && searchResult.sources.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Sources ({searchResult.sources.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {searchResult.sources.map((source, idx) => (
                          <Chip
                            key={idx}
                            icon={<DocumentIcon />}
                            label={source.filename}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Enrichment Suggestions */}
                  {searchResult.hasGaps && searchResult.enrichmentSuggestions && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Suggestions to Enrich Your Knowledge Base:
                        </Typography>
                        <List dense>
                          {searchResult.enrichmentSuggestions.map((suggestion, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemText primary={`• ${suggestion}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    </>
                  )}

                  {/* Related Topics */}
                  {searchResult.relatedTopics && searchResult.relatedTopics.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Related Topics
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {searchResult.relatedTopics.map((topic, idx) => (
                          <Chip
                            key={idx}
                            label={topic}
                            size="small"
                            onClick={() => setSearchQuery(topic)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        {/* Documents List */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Documents ({documents.length})
              </Typography>

              {documents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DocumentIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No documents uploaded yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      sx={{
                        border: '1px solid #E2E8F0',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': { bgcolor: '#F8FAFC' },
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteDocument(doc.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <DocumentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.filename}
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              {formatFileSize(doc.size)}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {doc.summary?.substring(0, 60)}...
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <List>
            {selectedFiles.map((file, idx) => (
              <ListItem key={idx}>
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
          
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                {uploadProgress < 100 ? 'Uploading and processing...' : 'Complete!'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KnowledgeBase;
