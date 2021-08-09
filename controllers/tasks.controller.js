const { response } = require("express");
const { convertTime } = require("../misc/convertTime");
const { restTimeHors } = require("../misc/restTime");
const Task = require("../models/tasks");

const addTask = async (req, res = response) => {
  const body = req.body;
  const { name, description, initialTime, restTime } = body;
  const time = Date.now();
  const now = new Date(time);

  const newTask = {
    name,
    description,
    initialTime,
    creationDate: now.toISOString(),
    restTime,
    statusTask: "NEW",
  };

  try {
    const task = new Task(newTask);
    await task.save(task);
    res.status(200).json({ msg: "Tarea agregada", task });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.toString() });
  }
};

const updateTask = async (req, res = response) => {
  const body = req.body;
  let { name, description, initialTime, restTime, id, statusTask } = body;
  let completedTime = "";
  if (statusTask === "FINISH") {
    completedTime = restTimeHors(restTime, initialTime);
  }
  const updateTask = {
    name,
    description,
    initialTime,
    restTime,
    statusTask,
    completedTime,
  };
  try {
    const task = await Task.findByIdAndUpdate(id, updateTask, { new: true });
    res.status(200).json({ msg: "Tarea actualizada", task });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.toString() });
  }
};

const getTask = async (req, res = response) => {
  const body = req.params;
  const { id } = body;
  try {
    const task = await Task.findById(id);
    res.status(200).json({ msg: "Tarea encontrada", task });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.toString() });
  }
};

const getTasks = async (req, res = response) => {
  const body = req.body;
  const { findStatus } = body;
  try {
    const task = await Task.find({ $or: findStatus });
    res.status(200).json({ msg: "Resultado", task });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.toString() });
  }
};

const deleteTask = async (req, res = response) => {
  const body = req.params;
  const { id } = body;
  try {
    const task = await Task.findByIdAndDelete(id);
    res.status(200).json({ msg: "Tarea Eliminada", task });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.toString() });
  }
};

const getReportTasks = async (req, res = response) => {
  const curr = new Date();
  const firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
  firstday.setDate(curr.getDate() - curr.getDay() - 1);
  const lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));

  //Estructura de data de grafica
  const data = [
    { day: 1, timeProduction: 0, label: "" },
    { day: 2, timeProduction: 0, label: "" },
    { day: 3, timeProduction: 0, label: "" },
    { day: 4, timeProduction: 0, label: "" },
    { day: 5, timeProduction: 0, label: "" },
    { day: 6, timeProduction: 0, label: "" },
    { day: 7, timeProduction: 0, label: "" },
  ];

  try {
    //Busca los dias de la semana y de tareas finalizadas
    const taskFind = await Task.find({
      statusTask: "FINISH",
      creationDate: {
        $gte: firstday.toISOString(),
        $lte: lastday.toISOString(),
      },
    });

    //Llena la estructura de la data
    if (taskFind.length) {
      taskFind.map((x) => {
        const date = Date.parse(x.creationDate);
        const neDate = new Date(date);
        //Convierte el tiempo trabajado a minutos
        const time = convertTime(x.completedTime);

        data[neDate.getDay()].timeProduction += time;
        data[neDate.getDay()].label =
          data[neDate.getDay()].timeProduction.toString();
      });
    }
    res.status(200).json({ msg: "Resultado", data });
  } catch (error) {
    res.status(500).json({ msg: "Error", error: error.toString() });
  }
};

module.exports = {
  addTask,
  updateTask,
  getTask,
  getTasks,
  deleteTask,
  getReportTasks,
};
