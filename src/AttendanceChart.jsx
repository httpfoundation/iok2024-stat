import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetAll } from "./tools/datoCmsTools";

const stageColors = {
  Plenáris: "#e74c3c",
  "Szakképzés 4.0, ITMP és NetAcad": "#3498db",
  "Digitális kultúra": "#9b59b6",
  "IT felsőoktatás": "#2ecc71",
  Összes: "#353b48",
};

const MINUTE_STEP = 20;

const AttendanceChart = ({ startingTime, endingTime }) => {
  const canvasRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const stages = useGetAll("stage", refreshKey);
  const attendances = useGetAll("attendance", refreshKey);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 1000 * 60 * 2);
    return () => window.clearInterval(interval);
  }, []);

  const filteredAttendances = useMemo(
    () =>
      attendances
        .flatMap((attendance) =>
          JSON.parse(attendance.attendances).flatMap((a) => ({
            ...a,
            id: attendance.registration,
          }))
        )
        .filter((attendance) => {
          const date = new Date(attendance.date);

          return (
            date.getTime() > startingTime.getTime() - 1000 * 60 * 60 &&
            date.getTime() < endingTime.getTime() + 1000 * 60 * 60
          );
        })
        .sort(
          (a, z) => new Date(a.date).getTime() - new Date(z.date).getTime()
        ),
    [attendances, startingTime, endingTime]
  );

  const getStageAttendances = useCallback(
    (stage) => {
      const groupped = Object.groupBy(
        filteredAttendances.filter((attendance) =>
          attendance.path.startsWith(`/szekcio/${stage || ""}`)
        ),
        (attendance) => {
          let date = new Date(attendance.date);
          date = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000
          );

          const hour = date.getHours().toString().padStart(2, "0");
          const min = getRoundedMinute(date.getMinutes(), MINUTE_STEP);

          return `${hour}:${min.toString().padStart(2, "0")}`;
        }
      );

      const res = {};
      for (const i in groupped) {
        res[i] = groupped[i].filter(
          (x, idx) => groupped[i].findIndex((i) => i.id === x.id) === idx
        );
      }

      return res;
    },
    [filteredAttendances]
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    // eslint-disable-next-line no-undef
    new Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: Object.keys(getStageAttendances(stages[0]?.slug)),
        datasets: [...stages, { name: "Összes", slug: "" }].map((stage) => ({
          label: stage.name,
          data: Object.values(getStageAttendances(stage.slug)).map(
            (x) => x.length
          ),
          fill: true,
          borderColor: stageColors[stage.name],
          lineTension: 0.1,
          backgroundColor: `${stageColors[stage.name]}05`,
        })),
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }, [stages, getStageAttendances]);

  return (
    <canvas id="myChart" width="400" height="200" ref={canvasRef}></canvas>
  );
};

function getRoundedMinute(min, step) {
  for (let i = 0; i < 60; i += step) {
    if (min <= i) return i;
  }
  return 0;
}

export default AttendanceChart;
