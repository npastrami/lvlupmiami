"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";

const Login: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from your API endpoint
    const fetchData = async () => {
      try {
        const response = await fetch("/api/hello"); // Replace with your API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-10">
      {data ? <p>API Response: {JSON.stringify(data)}</p> : <p>No data</p>}
    </div>
  );
};

export default Login;
