import {ResultsCode, taskAPI, TaskPriorities, TaskStatuses, TaskType} from "../../api/todolists-api";
import {addTodolistAC, clearState, removeTodolistAC, setTodolistsAC} from "./todolists-reducer";
import {AppThunkType} from "../../App/store";
import {setAppStatusAC} from "../../App/app-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    return taskAPI.getTasks(todolistId)
      .then((res) => {
        const tasks = res.data.items
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {tasks, todolistId}
      })
  })

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {} as TasksStateType,
  reducers: {
    removeTaskAC: (state, action: PayloadAction<RemoveTaskPayloadType>) => {
      const index = state[action.payload.todolistId].findIndex(t => t.id === action.payload.taskId);
      state[action.payload.todolistId].splice(index, 1);
    },
    addTaskAC: (state, action: PayloadAction<AddTaskPayloadType>) => {
      state[action.payload.task.todoListId].unshift(action.payload.task);
    },
    updateTaskAC: (state, action: PayloadAction<UpdateTaskPayloadType>) => {
      const task = state[action.payload.todolistId];
      const index = task.findIndex(t => t.id === action.payload.taskId);
      task[index] = {...task[index], ...action.payload.model};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addTodolistAC, (state, action) => {
      state[action.payload.todolist.id] = [];
    })
      .addCase(removeTodolistAC, (state, action) => {
        delete state[action.payload.todolistId];
      })
      .addCase(setTodolistsAC, (state, action) => {
        action.payload.todolists.forEach(tl => state[tl.id] = []);
      })
      .addCase(clearState, () => {
        return {} as TasksStateType
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      })
  }
})

export const tasksReducer = taskSlice.reducer
export const {
  removeTaskAC,
  addTaskAC,
  updateTaskAC,
} = taskSlice.actions;
/**
 * Thunk Creator
 */

export const removeTaskTC = (taskId: string, todolistId: string): AppThunkType => async dispatch => {
  dispatch(setAppStatusAC({status: 'loading'}));
  try {
    const res = await taskAPI.deleteTask(todolistId, taskId);
    if (res.data.resultCode === ResultsCode.OK) {
      dispatch(removeTaskAC({taskId, todolistId}));
    } else {
      handleServerAppError(res.data, dispatch);
    }
  } catch (err) {
    handleServerNetworkError(err, dispatch);
  } finally {
    dispatch(setAppStatusAC({status: 'succeeded'}));
  }
}
export const addTaskTC = (title: string, todolistID: string): AppThunkType => async dispatch => {
  dispatch(setAppStatusAC({status: 'loading'}));
  try {
    const res = await taskAPI.createTask(todolistID, title);
    if (res.data.resultCode === ResultsCode.OK) {
      dispatch(addTaskAC({task: res.data.data.item}));
    } else {
      handleServerAppError(res.data, dispatch);
    }
  } catch (err) {
    handleServerNetworkError(err, dispatch);
  } finally {
    dispatch(setAppStatusAC({status: 'succeeded'}));
  }
}
export const updateTaskTC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string): AppThunkType =>
  async (dispatch,
         getState) => {
    dispatch(setAppStatusAC({status: 'loading'}));
    try {
      const state = getState();
      const task = state.tasks[todolistId].find(t => t.id === taskId);
      if (!task) {
        console.warn('Task not found in the state');
        return;
      }
      const apiModel = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        deadline: task.deadline,
        ...model
      }
      const res = await taskAPI.updateTask(todolistId, taskId, apiModel)
      if (res.data.resultCode === ResultsCode.OK) {
        dispatch(updateTaskAC({taskId, model, todolistId}));
      } else {
        handleServerAppError(res.data, dispatch)
      }
    } catch (err) {
      handleServerNetworkError(err, dispatch)
    } finally {
      dispatch(setAppStatusAC({status: 'succeeded'}));
    }
  }

/**
 * types
 */
type RemoveTaskPayloadType = { taskId: string, todolistId: string }
type AddTaskPayloadType = { task: TaskType }
type UpdateTaskPayloadType = { taskId: string, model: UpdateDomainTaskModelType, todolistId: string }

export type TasksStateType = {
  [key: string]: TaskType[]
};

type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
};
