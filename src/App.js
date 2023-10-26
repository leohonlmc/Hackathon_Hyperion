import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Line, Text, Image } from "react-konva";
import "./App.css";

const WIDTH = 800;
const HEIGHT = 200;
const ROBOT_SIZE = 50;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50;
const FINISH_LINE = WIDTH - 50;

//obstacles tyes : easy, medium, hard
//state: liquid, soil, concrete

const OBSTACLE_TYPES = {
  easy: {
    color: "rgb(0, 194, 0)",
    delay: 0,
  },
  medium: {
    color: "yellow",
    delay: 3000,
  },
  hard: {
    color: "rgb(239, 63, 63)",
    delay: 5000,
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
  const [drillImage, setDrillImage] = useState(null);
  const [manholeImage, setManholeImage] = useState(null);

  const [easyImage, setEasyImage] = useState(null);
  const [mediumImage, setMediumImage] = useState(null);
  const [hardImage, setHardImage] = useState(null);

  const [performanceData, setPerformanceData] = useState({
    totalTime: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const addLog = (message, color = "white") => {
    if (!hasFinished) {
      setLogs((prevLogs) => [
        { message: `Time ${counter.toFixed(1)}s: ${message}`, color },
        ...prevLogs,
      ]);
      setCounter((prevCounter) => prevCounter + 0.5);
    }
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = "/drill.png";
    img.onload = () => {
      setDrillImage(img);
    };

    const imgManhole = new window.Image();
    imgManhole.src = "/manhole.png";
    imgManhole.onload = () => {
      setManholeImage(imgManhole);
    };

    const loadImg = (src, setter) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setter(img);
    };

    loadImg("/easy.png", setEasyImage);
    loadImg("/medium.png", setMediumImage);
    loadImg("/hard.png", setHardImage);

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
            } debris at position ${obstacle.x}, ${obstacle.y}.`
          );
          setIsBlocked(true);

          setTimeout(() => {
            setObstacles((prevObstacles) =>
              prevObstacles.filter((o) => o.x !== obstacle.x)
            );
            addLog(
              `Pass through ${obstacle.type} debris at position ${obstacle.x}, ${obstacle.y}.`,
              OBSTACLE_TYPES[obstacle.type].color
            );

            if (obstacle.type === "easy") {
              setEasy((counter + 1).toFixed(1));
            } else if (obstacle.type === "medium") {
              setMedium((counter + 3).toFixed(1));
            } else if (obstacle.type === "hard") {
              setHard((counter + 5).toFixed(1));
            }

            setPerformanceData((prevData) => {
              const newData = { ...prevData };
              newData[obstacle.type] +=
                OBSTACLE_TYPES[obstacle.type].delay / 1000;
              newData.totalTime += OBSTACLE_TYPES[obstacle.type].delay / 1000;
              return newData;
            });
            setIsBlocked(false);
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
      <nav
        class="navbar navbar-light bg-light"
        style={{ padding: "10px 20px" }}
      >
        <a class="navbar-brand" href="#">
          <img
            src="drill.png"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt=""
          />
          R.A.T
        </a>
      </nav>
      <h2 style={{ textAlign: "center", padding: "10px 0px" }}>
        Robot Assisted Tunnelling​ Dashboard
      </h2>
      <div className="App-body">
        <Stage
          width={WIDTH}
          height={HEIGHT}
          style={{ border: "1px solid black" }}
        >
          <Layer>
            <Image
              x={0}
              y={PATH[0].y - OBSTACLE_HEIGHT / 2}
              width={OBSTACLE_WIDTH}
              height={OBSTACLE_HEIGHT}
              image={manholeImage}
            />
            <Line
              points={PATH.flatMap((point) => [point.x, point.y])}
              stroke="green"
              strokeWidth={2}
            />
            {drillImage && (
              <Image
                x={robotPosition.x}
                y={robotPosition.y}
                width={ROBOT_SIZE}
                height={ROBOT_SIZE}
                image={drillImage}
              />
            )}
            {obstacles.map((obstacle, index) => (
              <>
                {obstacle.state === "intact" && (
                  <Image
                    key={`obstacle-${index}`}
                    x={obstacle.x}
                    y={obstacle.y}
                    width={OBSTACLE_WIDTH}
                    height={OBSTACLE_HEIGHT}
                    image={
                      obstacle.type === "easy"
                        ? easyImage
                        : obstacle.type === "medium"
                        ? mediumImage
                        : hardImage
                    }
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
            <Image
              x={WIDTH - OBSTACLE_WIDTH}
              y={PATH[PATH.length - 1].y - OBSTACLE_HEIGHT / 2}
              width={OBSTACLE_WIDTH}
              height={OBSTACLE_HEIGHT}
              image={manholeImage}
            />
          </Layer>
        </Stage>
        <div className="d-flex">
          <div className="log-div" style={{ textAlign: "left" }}>
            <h3>Tracking Logs:</h3>

            <div>
              <ul>
                {logs.map((log, index) => (
                  <li key={index} style={{ backgroundColor: log.color }}>
                    {log.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="report-div" style={{ textAlign: "left" }}>
            <h3>Performance Report:</h3>
            <ul>
              <li>Total time: {totalTime}s</li>
              <li className="easy">
                Time to encounter and break <strong>easy</strong> obstacles:{" "}
                {easy}s
              </li>
              <li style={{ backgroundColor: "yellow" }}>
                Time to encounter and break <strong>medium</strong> obstacles:{" "}
                {medium}s
              </li>
              <li className="hard">
                Time to encounter and break <strong>hard</strong> obstacles:{" "}
                {hard}s
              </li>
            </ul>
            <hr />
            <h3>Equipment:</h3>
            <ul>
              <li></li>
              <li></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RobotVisualization;
