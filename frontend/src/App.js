import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import {
  AppBar, Toolbar, Typography, Container, Tabs, Tab, Box, Grid, Card, CardMedia, CardContent,
  CardActions, Button, IconButton, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, CssBaseline, Fab, List, ListItem, ListItemText, Divider,
  Switch, FormControlLabel, Chip, Select, MenuItem, FormControl, InputLabel, OutlinedInput
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LogoutIcon from '@mui/icons-material/Logout';

const API_URL = 'https://mangacollect-backend.onrender.com/api';

const ImageCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  }, [webcamRef, onCapture]);

  const videoConstraints = {
    facingMode: "environment" // usa la camera posteriore su mobile
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        videoConstraints={videoConstraints}
      />
      <Button onClick={capture} variant="contained" sx={{ mt: 1 }}>Scatta Foto</Button>
    </Box>
  );
};

function FumettoDetailDialog({ open, onClose, series, onEdit, onDelete }) {
  if (!series || series.length === 0) return null;

  const firstIssue = series[0];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{firstIssue.titolo}</DialogTitle>
      <DialogContent>
        <List>
          {series.map((fumetto, index) => (
            <React.Fragment key={fumetto.id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => onEdit(fumetto)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => onDelete(fumetto.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`Numero: ${fumetto.numero}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {`Autore: ${fumetto.autore || 'N/A'} - Editore: ${fumetto.editore || 'N/A'}`}
                      </Typography>
                      <br />
                      {`Note: ${fumetto.note || 'Nessuna'}`}
                    </>
                  }
                />
              </ListItem>
              {index < series.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
}


function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [showAll, setShowAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loginOpen, setLoginOpen] = useState(!userName);

  const itemTypes = ['fumetti', 'funkopop', 'figure'];
  const currentType = itemTypes[tabIndex];

  // Carica la lista degli utenti
  useEffect(() => {
    if (userName) {
      axios.get(`${API_URL}/users`)
        .then(res => setAllUsers(res.data))
        .catch(err => console.error('Error fetching users:', err));
    }
  }, [userName]);

  const fetchItems = useCallback(() => {
    let params = {};
    if (showAll) {
      // Mostra tutto, nessun filtro
      params = {};
    } else if (selectedUsers.length > 0) {
      // Mostra solo gli utenti selezionati
      params = { userName: selectedUsers };
    } else {
      // Mostra solo i miei
      params = { userName };
    }
    
    axios.get(`${API_URL}/${currentType}`, { params })
      .then(res => setItems(res.data))
      .catch(err => console.error(`Error fetching ${currentType}:`, err));
  }, [currentType, userName, showAll, selectedUsers]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleLogin = (name) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setUserName('');
    localStorage.removeItem('userName');
    setLoginOpen(true);
    setShowAll(false);
    setSelectedUsers([]);
    setAllUsers([]);
  };

  const handleUserFilterChange = (event) => {
    const value = event.target.value;
    setSelectedUsers(typeof value === 'string' ? value.split(',') : value);
    setShowAll(false);
  };

  const handleShowAllChange = (event) => {
    const checked = event.target.checked;
    setShowAll(checked);
    if (checked) {
      setSelectedUsers([]);
    }
  };

  const handleFormOpen = (item = null) => {
    setCurrentItem(item);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setCurrentItem(null);
  };

  const handleDetailOpen = (series) => {
    setSelectedSeries(series);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedSeries(null);
  };

  const handleSave = (itemData) => {
    const isNew = !itemData.id;
    const method = isNew ? 'post' : 'put';
    const url = isNew ? `${API_URL}/${currentType}` : `${API_URL}/${currentType}/${itemData.id}`;
    
    // Aggiungi userName agli oggetti nuovi
    const dataToSave = isNew ? { ...itemData, userName } : itemData;

    axios[method](url, dataToSave)
      .then((res) => {
        fetchItems(); // Ricarica i dati per riflettere le modifiche
        handleFormClose();
      })
      .catch(err => console.error(`Error saving ${currentType}:`, err));
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${currentType}/${id}`)
      .then(() => {
        fetchItems();
        // Se il dettaglio è aperto, aggiorniamo anche quello
        if (selectedSeries) {
            const updatedSeries = selectedSeries.filter(item => item.id !== id);
            if (updatedSeries.length > 0) {
                setSelectedSeries(updatedSeries);
            } else {
                handleDetailClose();
            }
        }
      })
      .catch(err => console.error(`Error deleting ${currentType}:`, err));
  };

  const getFields = () => {
    switch (currentType) {
      case 'fumetti':
        return { titolo: '', numero: '', autore: '', editore: '', anno: '', condizione: '', immagine: '', note: '' };
      case 'funkopop':
        return { nome: '', numero: '', serie: '', condizione: '', immagine: '', note: '' };
      case 'figure':
        return { nome: '', marca: '', altezza_cm: '', condizione: '', immagine: '', note: '' };
      default:
        return {};
    }
  };

  const renderItems = () => {
    if (currentType === 'fumetti') {
      return items.map((series, index) => {
        if (!series || series.length === 0) return null;
        const firstIssue = series[0];
        if (!firstIssue) return null;

        return (
          <Grid item key={firstIssue.titolo + index} xs={12} sm={6} md={4}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => handleDetailOpen(series)}>
              <CardMedia
                component="img"
                height="140"
                image={firstIssue.immagine || 'https://via.placeholder.com/300x140.png?text=Nessuna+Immagine'}
                alt={firstIssue.titolo}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" component="div" noWrap title={firstIssue.titolo} sx={{ flexGrow: 1 }}>
                    {firstIssue.titolo}
                  </Typography>
                  {(showAll || selectedUsers.length > 0) && firstIssue.userName && (
                    <Chip label={firstIssue.userName} size="small" color="primary" />
                  )}
                </Box>
                <Typography color="text.secondary">
                  {series.length} {series.length > 1 ? 'albi' : 'albo'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      });
    }

    // Default rendering for funko and figure
    return items.map(item => (
      <Grid item key={item.id} xs={12} sm={6} md={4}>
        <Card>
          {item.immagine && (
            <CardMedia
              component="img"
              height="140"
              image={item.immagine}
              alt={item.titolo || item.nome}
            />
          )}
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="div" noWrap title={item.titolo || item.nome} sx={{ flexGrow: 1 }}>
                {item.titolo || item.nome}
              </Typography>
              {(showAll || selectedUsers.length > 0) && item.userName && (
                <Chip label={item.userName} size="small" color="primary" />
              )}
            </Box>
            {item.numero && <Typography color="text.secondary">Numero: {item.numero}</Typography>}
            {item.autore && <Typography color="text.secondary">Autore: {item.autore}</Typography>}
            {item.editore && <Typography color="text.secondary">Editore: {item.editore}</Typography>}
            {item.serie && <Typography color="text.secondary">Serie: {item.serie}</Typography>}
            {item.marca && <Typography color="text.secondary">Marca: {item.marca}</Typography>}
          </CardContent>
          <CardActions>
            <IconButton onClick={() => handleFormOpen(item)}><EditIcon /></IconButton>
            <IconButton onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Il Mio Raccoglitore
          </Typography>
          {userName && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {userName}
              </Typography>
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, pb: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Switch checked={showAll} onChange={handleShowAllChange} />}
            label="Mostra tutti"
          />
          {!showAll && allUsers.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="user-filter-label">Filtra per utente</InputLabel>
              <Select
                labelId="user-filter-label"
                multiple
                value={selectedUsers}
                onChange={handleUserFilterChange}
                input={<OutlinedInput label="Filtra per utente" />}
                renderValue={(selected) => selected.length === 0 ? 'Solo i miei' : selected.join(', ')}
              >
                {allUsers.filter(u => u !== userName).map((user) => (
                  <MenuItem key={user} value={user}>
                    {user}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} centered>
            <Tab label="Fumetti" />
            <Tab label="FunkoPop" />
            <Tab label="Figure" />
          </Tabs>
        </Box>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {renderItems()}
        </Grid>

        <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => handleFormOpen(getFields())}>
          <AddIcon />
        </Fab>

        {formOpen && (
          <ItemFormDialog
            open={formOpen}
            onClose={handleFormClose}
            onSave={handleSave}
            item={currentItem}
            itemType={currentType}
          />
        )}

        {selectedSeries && (
            <FumettoDetailDialog
                open={detailOpen}
                onClose={handleDetailClose}
                series={selectedSeries}
                onEdit={(item) => {
                    handleDetailClose();
                    handleFormOpen(item);
                }}
                onDelete={handleDelete}
            />
        )}

        <LoginDialog open={loginOpen} onLogin={handleLogin} />
      </Container>
    </>
  );
}

function ItemFormDialog({ open, onClose, onSave, item, itemType }) {
  const [formData, setFormData] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    setFormData(item);
    setShowCamera(false);
  }, [item]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCapture = (imageSrc) => {
    setFormData(prev => ({ ...prev, immagine: imageSrc }));
    setShowCamera(false);
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const getTitle = () => {
    const action = item && item.id ? 'Modifica' : 'Aggiungi';
    let typeName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    if (typeName.endsWith('i')) {
        typeName = typeName.slice(0, -1);
    }
    return `${action} ${typeName}`;
  };

  const renderFields = () => {
    if (!formData) return null;
    return Object.keys(formData)
      .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'immagine')
      .map(field => (
      <TextField
        key={field}
        margin="dense"
        name={field}
        label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
        type={['numero', 'anno', 'altezza_cm'].includes(field) ? 'number' : 'text'}
        fullWidth
        variant="standard"
        value={formData[field] || ''}
        onChange={handleChange}
      />
    ));
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {showCamera ? (
          <ImageCapture onCapture={handleCapture} />
        ) : (
          <>
            {formData.immagine && (
              <Box sx={{ my: 2, textAlign: 'center' }}>
                <img src={formData.immagine} alt="Anteprima" style={{ maxHeight: '150px', maxWidth: '100%' }} />
              </Box>
            )}
            <Button
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={() => setShowCamera(true)}
              sx={{ mb: 2 }}
            >
              {formData.immagine ? 'Sostituisci Foto' : 'Scatta Foto'}
            </Button>
            {renderFields()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSubmit}>Salva</Button>
      </DialogActions>
    </Dialog>
  );
}

function LoginDialog({ open, onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>Benvenuto!</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Inserisci il tuo nome per iniziare a usare l'app
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Nome utente"
          type="text"
          fullWidth
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Inizia
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default App;
