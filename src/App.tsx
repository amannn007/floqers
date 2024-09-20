import React, { useEffect, useState } from 'react';
import MainTable from './components/MainTable';
import './App.css';

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/myData.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((jsonData) => setData(jsonData))
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Job Data - Main Table</h1>
      {data.length > 0 ? <MainTable data={data} /> : <p>Loading...</p>}
    </div>
  );
};

export default App;
