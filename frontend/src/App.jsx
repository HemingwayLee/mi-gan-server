import Button from '@mui/material/Button';
import React from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Cookies from 'js-cookie';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';


export default function Dashboard() {
  const [fileList, setFileList] = React.useState([]);
  const [clickedId, setClickedId] = React.useState(0);
  const [selectedImg, setSelectedImg] = React.useState(0);
  
  React.useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const url = `/api/list/images/`
    try {
      const response = await fetch(url);
      if (response.statusText === 'OK') {
        const data = await response.json();
        console.log(data);
        setFileList(data.images.map((x, idx) => {
          return {
            "img": x,
            "id": idx
          }
        }));
      } else {
        throw new Error('Request failed')
      }
    } catch (error) {
      console.log(error);
    }
  }

  const doUpdate = (updatedText) => {
    fetch(`/api/update/${clickedId}/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
      body: JSON.stringify({
        text: updatedText
      })
    })
    .then(function(response) {
      if (response.status === 200) {
        return response.json();
      } else {
        alert("backend errors")
      }
    })
    .then(function(myJson) {
      // getData();
      // alert(myJson["result"]);
    });
  }

  const handleDropDownChange = (e) => {
    setSelectedImg(e.target.value);
  }
  
  return (
      <Box sx={{ display: 'flex' }}>
        <Box
          component="main"
          sx={{
            backgroundColor: '#AAAAAA',
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Select
                    labelId="img-select-label"
                    id="img-select"
                    value={selectedImg}
                    label="selectedImg"
                    onChange={handleDropDownChange}
                  >
                    {
                      fileList.map(x => (
                        <MenuItem key={`menu-${x.id}`} value={x.id}>{x.img}</MenuItem>
                      ))
                    }
                  </Select>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Button variant="contained" component="label">Init database from TRANS.txt</Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
  );
}
