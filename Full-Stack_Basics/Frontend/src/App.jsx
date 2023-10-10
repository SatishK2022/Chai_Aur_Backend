import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [jokes, setjokes] = useState([]);

  useEffect(() => {
    axios
      .get("/api/jokes")
      .then((response) => {
        setjokes(response.data);
      })
      .catch((error) => {
        console.log(error);
      }),
      [];
  });

  return (
    <div>
      <h1>Chai and Full-Stack</h1>
      <p>Jokes: {jokes.length}</p>

      {jokes.map((joke, index) => (
        <div key={joke.id}>
          <h3>{index + 1}. {joke.joke}</h3>
        </div>
      ))}
    </div>
  );
};

export default App;
