import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Data = {
  work_year: string;
  salary_in_usd: string;
  job_title: string;
};

type MainTableProps = {
  data: Data[];
};

const MainTable: React.FC<MainTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<'year' | 'totalJobs' | 'avgSalaryUsd'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedYear, setSelectedYear] = useState<string | null>(null); // Track selected year for second table

  // Function to calculate total jobs and average salary for Main Table
  const calculateMainTableData = () => {
    const yearMap: { [year: string]: { totalJobs: number; totalSalary: number } } = {};

    data.forEach(item => {
      const year = item.work_year;
      const salary = parseFloat(item.salary_in_usd);

      if (yearMap[year]) {
        yearMap[year].totalJobs += 1;
        yearMap[year].totalSalary += salary;
      } else {
        yearMap[year] = { totalJobs: 1, totalSalary: salary };
      }
    });

    return Object.entries(yearMap).map(([year, { totalJobs, totalSalary }]) => ({
      year,
      totalJobs,
      avgSalaryUsd: totalSalary / totalJobs,
    }));
  };

  const mainTableData = calculateMainTableData();

  // Sorting logic wrapped in useMemo to avoid re-sorting on every render
  const sortedTableData = useMemo(() => {
    const sorted = [...mainTableData].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [mainTableData, sortKey, sortOrder]);

  const handleSort = (key: 'year' | 'totalJobs' | 'avgSalaryUsd') => {
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
  };

  // Handle row click to display job titles for that year
  const handleRowClick = (year: string) => {
    setSelectedYear(year === selectedYear ? null : year); // Toggle the year selection
  };

  // Aggregate job titles for the selected year
  const jobTitlesForYear = useMemo(() => {
    if (!selectedYear) return [];

    const titlesMap: { [title: string]: number } = {};

    data
      .filter(item => item.work_year === selectedYear)
      .forEach(item => {
        const title = item.job_title;
        if (titlesMap[title]) {
          titlesMap[title] += 1;
        } else {
          titlesMap[title] = 1;
        }
      });

    return Object.entries(titlesMap).map(([job_title, count]) => ({ job_title, count }));
  }, [selectedYear, data]);

  // Filter data for the line graph to show changes from 2020 to 2024
  const filteredGraphData = mainTableData.filter(item => 
    parseInt(item.year) >= 2020 && parseInt(item.year) <= 2024
  );

  return (
    <div>
      <h2>Job Data Table</h2>
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => handleSort('year')}>
              Year {sortKey === 'year' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('totalJobs')}>
              Total Jobs {sortKey === 'totalJobs' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('avgSalaryUsd')}>
              Average Salary (USD) {sortKey === 'avgSalaryUsd' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTableData.map((row, index) => (
            <tr key={index} onClick={() => handleRowClick(row.year)} style={{ cursor: 'pointer' }}>
              <td>{row.year}</td>
              <td>{row.totalJobs}</td>
              <td>{row.avgSalaryUsd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedYear && (
        <div>
          <h2>Job Titles in {selectedYear}</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {jobTitlesForYear.map((row, index) => (
                <tr key={index}>
                  <td>{row.job_title}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Job Trends (2020-2024)</h2>
      <div className="line-chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredGraphData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="totalJobs" stroke="#6200ea" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MainTable;
