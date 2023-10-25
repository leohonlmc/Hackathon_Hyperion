import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import "./App.css";

const WIDTH = 800;
const HEIGHT = 200;
const ROBOT_SIZE = 50;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50;
const FINISH_LINE = WIDTH - 50;

//obstacles tyes : easy, medium, hard
//state: liquid, soil, concrete
//distance

const OBSTACLE_TYPES = {
  easy: {
    color: "green",
    delay: 0,
  },
  medium: {
    color: "yellow",
    delay: 3000, // 3 seconds
  },
  hard: {
    color: "red",
    delay: 5000, // 5 seconds
  },
};

const PATH = [
  { x: 0, y: 75 },
  { x: 150, y: 50 },
  { x: 300, y: 75 },
  { x: 450, y: 100 },
  { x: 600, y: 75 },
  { x: 750, y: 50 },
  { x: WIDTH, y: 75 },
];

function RobotVisualization() {
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 75 });
  const [obstacles, setObstacles] = useState([
    { x: 150, y: 75, type: "easy", state: "intact" },
    { x: 300, y: 75, type: "medium", state: "intact" },
    { x: 450, y: 75, type: "hard", state: "intact" },
  ]);
  const [logs, setLogs] = useState([]);
  const [counter, setCounter] = useState(0.0);
  const [hasFinished, setHasFinished] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [easy, setEasy] = useState(0);
  const [medium, setMedium] = useState(0);
  const [hard, setHard] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [performanceData, setPerformanceData] = useState({
    totalTime: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const addLog = (message, color = "white") => {
    if (!hasFinished) {
      setLogs((prevLogs) => [
        ...prevLogs,
        { message: `Time ${counter.toFixed(1)}s: ${message}`, color },
      ]);
      setCounter((prevCounter) => prevCounter + 0.5);
    }
  };

  useEffect(() => {
    const robotInterval = setInterval(() => {
      if (hasFinished || isBlocked) {
        clearInterval(robotInterval);
        return;
      }

      let newPosition = { ...robotPosition };
      newPosition.x += 10;

      addLog(`Robot moved forward 10 units.`);

      let nextPathPoint = PATH.find((pt) => pt.x > robotPosition.x);
      if (nextPathPoint) {
        if (robotPosition.y < nextPathPoint.y) {
          newPosition.y += 5;
          addLog(`Robot moved left.`);
        } else if (robotPosition.y > nextPathPoint.y) {
          newPosition.y -= 5;
          addLog(`Robot moved right.`);
        }
      }

      let encounteredObstacle = false;

      for (let obstacle of obstacles) {
        if (
          newPosition.x + ROBOT_SIZE > obstacle.x &&
          newPosition.x < obstacle.x + OBSTACLE_WIDTH &&
          (obstacle.state === undefined || obstacle.state === "intact")
        ) {
          encounteredObstacle = true;
          addLog(
            `Encountered a ${OBSTACLE_TYPES[obstacle.type].color} ${
              obstacle.type
            } obstacle at position ${obstacle.x}, ${obstacle.y}.`
          );
          setIsBlocked(true); // Set the robot to be blocked

          setTimeout(() => {
            setObstacles((prevObstacles) =>
              prevObstacles.filter((o) => o.x !== obstacle.x)
            );
            addLog(
              `Used drill to split ${obstacle.type} obstacle at position ${obstacle.x}, ${obstacle.y} and cleaned the pieces.`,
              OBSTACLE_TYPES[obstacle.type].color
            );

            if (obstacle.type === "easy") {
              setEasy(counter.toFixed(1) + 1);
            } else if (obstacle.type === "medium") {
              setMedium(counter.toFixed(1) + 3);
            } else if (obstacle.type === "hard") {
              setHard(counter.toFixed(1) + 5);
            }

            // Update the performance data
            setPerformanceData((prevData) => {
              const newData = { ...prevData };
              newData[obstacle.type] +=
                OBSTACLE_TYPES[obstacle.type].delay / 1000; // Convert ms to seconds
              newData.totalTime += OBSTACLE_TYPES[obstacle.type].delay / 1000;
              return newData;
            });
            setIsBlocked(false); // Robot is no longer blocked
          }, OBSTACLE_TYPES[obstacle.type].delay);

          break;
        }
      }

      if (newPosition.x >= FINISH_LINE && !isBlocked) {
        addLog("Robot has reached the finish line.");
        setHasFinished(true);
        setTotalTime(counter + 1 + 3 + 5);
      }

      setRobotPosition(newPosition);
    }, 500);

    return () => {
      clearInterval(robotInterval);
    };
  }, [robotPosition, obstacles, counter, hasFinished, isBlocked]);

  return (
    <div className="App">
      <nav class="navbar navbar-light bg-light">
        <a class="navbar-brand" href="#">
          Hackathon Solution
        </a>
      </nav>
      <div className="App-body">
        <Stage width={WIDTH} height={HEIGHT}>
          <Layer>
            <Line
              points={PATH.flatMap((point) => [point.x, point.y])}
              stroke="green"
              strokeWidth={2}
            />
            <Rect
              x={robotPosition.x}
              y={robotPosition.y}
              width={ROBOT_SIZE}
              height={ROBOT_SIZE}
              fill="blue"
            />
            {obstacles.map((obstacle, index) => (
              <>
                {obstacle.state === "intact" && (
                  <Rect
                    key={`rect-${index}`}
                    x={obstacle.x}
                    y={obstacle.y}
                    width={OBSTACLE_WIDTH}
                    height={OBSTACLE_HEIGHT}
                    fill={OBSTACLE_TYPES[obstacle.type].color}
                  />
                )}
                {obstacle.state === "split" && (
                  <>
                    <Rect
                      key={`left-rect-${index}`}
                      x={obstacle.x}
                      y={obstacle.y}
                      width={OBSTACLE_WIDTH / 2}
                      height={OBSTACLE_HEIGHT}
                      fill={OBSTACLE_TYPES[obstacle.type].color}
                    />
                    <Rect
                      key={`right-rect-${index}`}
                      x={obstacle.x + OBSTACLE_WIDTH / 2}
                      y={obstacle.y}
                      width={OBSTACLE_WIDTH / 2}
                      height={OBSTACLE_HEIGHT}
                      fill={OBSTACLE_TYPES[obstacle.type].color}
                    />
                  </>
                )}
                <Text
                  key={`text-${index}`}
                  x={obstacle.x}
                  y={obstacle.y + OBSTACLE_HEIGHT / 2 - 10}
                  width={OBSTACLE_WIDTH}
                  text={obstacle.type}
                  fontSize={12}
                  fontFamily="Arial"
                  align="center"
                  verticalAlign="middle"
                />
              </>
            ))}

            <Line
              points={[FINISH_LINE, 0, FINISH_LINE, HEIGHT]}
              stroke="black"
              strokeWidth={4}
              dash={[10, 10]}
            />
          </Layer>
        </Stage>
        <div className="d-flex">
          <div className="log-div" style={{ textAlign: "left" }}>
            <h3>Logs:</h3>
            <ul>
              {logs.map((log, index) => (
                <li key={index} style={{ backgroundColor: log.color }}>
                  {log.message}
                </li>
              ))}
            </ul>
          </div>
          <div className="report-div" style={{ textAlign: "left" }}>
            <h3>Report:</h3>
            <ul>
              <li>Total time: {totalTime}s</li>
              <li>Time to break easy obstacles: {easy}s</li>
              <li>Time to break medium obstacles: {medium}s</li>
              <li>Time to break hard obstacles: {hard}s</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RobotVisualization;
