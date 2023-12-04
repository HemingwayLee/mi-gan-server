import Button from '@mui/material/Button';
import React from 'react';
import moment from 'moment';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import Cookies from 'js-cookie';
import {
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination
} from '@mui/material';
import EditDialog from './dialog';
import Player from './Player';

export default function Dashboard() {
  const [fileList, setFileList] = React.useState([]);
  const [fileCount, setFileCount] = React.useState(0);
  const [theText, setTheText] = React.useState('');
  const [freqData, setFreqData] = React.useState([]);
  const [clickedId, setClickedId] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const [controller, setController] = React.useState({
    page: 0,
    rowsPerPage: 10
  });
  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const editRef = React.useRef(null);

  React.useEffect(() => {
    getData();
  }, [controller]);

  const getData = async () => {
    const url = `/api/show/page/${controller.page}/size/${controller.rowsPerPage}/`
    try {
      const response = await fetch(url);
      if (response.statusText === 'OK') {
        const data = await response.json();
        console.log(data);
        setFileList(data.data);
        setFileCount(data.total);
      } else {
        throw new Error('Request failed')
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setController({
      ...controller,
      page: newPage
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setController({
      ...controller,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    });
  };

  const handleEditClose = (isSave, updatedText) => {
    if (isSave) {
      doUpdate(updatedText);
    }

    setEditOpen(false);
  };

  const doInsert = () => {
    fetch('/api/insert/', {
      method: 'GET',
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      getData();
      alert(myJson["result"]);
    });
  }

  const doSave = () => {
    fetch('/api/save/labels/', {
      method: 'GET',
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      alert("saved");
    });
  }

  const doCleanup = () => {
    fetch('/api/cleanup/', {
      method: 'GET',
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      alert("clean up already");
    });
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
      getData();
      // alert(myJson["result"]);
    });
  }

  const getFreqWords = (page) => {
    console.log(page);

    fetch(`api/freq/word/${page}/`, {
      method: 'GET',
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(myJson["result"])
      setFreqData(myJson["result"])
    });
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
                  <Card>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            Id
                          </TableCell>
                          <TableCell>
                            Filename
                          </TableCell>
                          <TableCell>
                            Text
                          </TableCell>
                          <TableCell>
                            Create At
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fileList.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              {file.id}
                            </TableCell>
                            <TableCell>
                              {file.filename}
                              <Player url={`http://${window.location.hostname}:8000/media/train/5_3039/${file.filename}`}/>
                            </TableCell>
                            <TableCell onClick={()=>{  
                              console.log(`${file.id} ${file.text}`)

                              setEditOpen(true);
                              setClickedId(file.id);
                              editRef.current.setTextFromParent(file.text); 
                            }}>
                              {file.text}
                            </TableCell>
                            <TableCell>
                              {file.created_at}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      component="div"
                      onPageChange={handlePageChange}
                      page={controller.page}
                      count={fileCount}
                      rowsPerPage={controller.rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </Card>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Button variant="contained" component="label" onClick={doInsert}>Init database from TRANS.txt</Button>
                  <Button variant="contained" component="label" onClick={doSave}>Save all labels from database to TRANS.txt file</Button>
                  <Button variant="contained" component="label" onClick={doCleanup}>Cleanup database and wav files without text</Button>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, overflowX: "auto", overflowY: "hidden" }}>
                  <div style={{textAlign: "center"}}>
                  {
                    buttons.map(btn => {
                      return (<Button onClick={()=>{getFreqWords(btn)}}>{btn}</Button>)
                    })
                  }
                  </div>
                  <BarChart width={2200} height={300} data={freqData}>
                    <Bar dataKey="freq" fill="green" />
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="char" />
                    <YAxis />
                  </BarChart>
                </Paper>
              </Grid>
            </Grid>
          </Container>
          <EditDialog 
            ref={editRef}
            onClose={handleEditClose} 
            open={editOpen} 
          />
        </Box>
      </Box>
  );
}
