import {addTaskAC, changeTaskStatusAC, changeTaskTitleAC, removeTaskAC, tasksReducer} from './tasks-reducer';
import {TasksStateType} from '../App';
import {addTodolistAC, removeTodolistAC} from "./todolists-reducer";
import {TaskPriorities, TaskStatuses} from "../api/todolists-api";

let startState: TasksStateType;

beforeEach(() => {
      startState = {
         "todolistId1": [
            {
               id: "1", title: "CSS",
               status: TaskStatuses.New,
               addedDate: '',
               deadline: '',
               description: '',
               order: 0,
               priority: TaskPriorities.low,
               startDate: '',
               todoListId: 'todolistId1'
            },
            {
               id: "2", title: "JS",
               status: TaskStatuses.Completed,
               addedDate: '',
               deadline: '',
               description: '',
               order: 0,
               priority: TaskPriorities.low,
               startDate: '',
               todoListId: 'todolistId1'
            },
            {
               id: "3", title: "React",
               status: TaskStatuses.New,
               addedDate: '',
               deadline: '',
               description: '',
               order: 0,
               priority: TaskPriorities.low,
               startDate: '',
               todoListId: 'todolistId1'
            },
         ],
         "todolistId2": [
            {
               id: "1", title: "bread",
               status: TaskStatuses.New,
               addedDate: '',
               deadline: '',
               description: '',
               order: 0,
               priority: TaskPriorities.low,
               startDate: '',
               todoListId: 'todolistId2'
            },
            {
               id: "2", title: "milk",
               status: TaskStatuses.Completed,
               addedDate: '',
               deadline: '',
               description: '',
               order: 0,
               priority: TaskPriorities.low,
               startDate: '',
               todoListId: 'todolistId2'
            },
            {
               id: "3", title: "tea",
               status: TaskStatuses.New,
               addedDate: '',
               deadline: '',
               description: '',
               order: 0,
               priority: TaskPriorities.low,
               startDate: '',
               todoListId: 'todolistId2'
            },
         ],
      }
   }
)

test('correct task should be deleted from correct array', () => {
   const action = removeTaskAC("2", "todolistId2");

   const endState = tasksReducer(startState, action);

   expect(endState).toEqual({
      "todolistId1": [
         {
            id: "1", title: "CSS",
            status: TaskStatuses.New,
            addedDate: '',
            deadline: '',
            description: '',
            order: 0,
            priority: TaskPriorities.low,
            startDate: '',
            todoListId: 'todolistId1'
         },
         {
            id: "2", title: "JS",
            status: TaskStatuses.Completed,
            addedDate: '',
            deadline: '',
            description: '',
            order: 0,
            priority: TaskPriorities.low,
            startDate: '',
            todoListId: 'todolistId1'
         },
         {
            id: "3", title: "React",
            status: TaskStatuses.New,
            addedDate: '',
            deadline: '',
            description: '',
            order: 0,
            priority: TaskPriorities.low,
            startDate: '',
            todoListId: 'todolistId1'
         },
      ],
      "todolistId2": [
         {
            id: "1", title: "bread",
            status: TaskStatuses.New,
            addedDate: '',
            deadline: '',
            description: '',
            order: 0,
            priority: TaskPriorities.low,
            startDate: '',
            todoListId: 'todolistId2'
         },
         {
            id: "3", title: "tea",
            status: TaskStatuses.New,
            addedDate: '',
            deadline: '',
            description: '',
            order: 0,
            priority: TaskPriorities.low,
            startDate: '',
            todoListId: 'todolistId2'
         },
      ],
   });
   expect(endState["todolistId2"].length).toBe(2);
   expect(endState["todolistId2"].every(t => t.id !== '2')).toBeTruthy();
});

test('correct task should be added to correct array', () => {
   const action = addTaskAC("juce", "todolistId2");

   const endState = tasksReducer(startState, action);

   expect(endState["todolistId1"].length).toBe(3);
   expect(endState["todolistId2"].length).toBe(4);
   expect(endState["todolistId2"][0].id).toBeDefined();
   expect(endState["todolistId2"][0].title).toBe("juce");
   expect(endState["todolistId2"][0].status).toBe(TaskStatuses.New);
})

test('status of specified task should be changed', () => {
   const action = changeTaskStatusAC("2", TaskStatuses.New, "todolistId2");

   const endState = tasksReducer(startState, action);

   expect(endState["todolistId2"][1].status).toBe(TaskStatuses.New);
   expect(endState["todolistId2"][1].title).toBe('milk');
   expect(endState["todolistId2"][0].id).toBeDefined();
});

test('Should change the title of the task', () => {
   const action = changeTaskTitleAC('3', 'Vue', 'todolistId1');

   const endState = tasksReducer(startState, action);

   expect(endState["todolistId1"][2].title).toBe('Vue');
   expect(endState["todolistId1"][2].id).toBe('3');
   expect(endState["todolistId1"][2].status).toBe(TaskStatuses.New);
   expect(endState["todolistId2"][2].title).toBe('tea');
})

test('new array should be added when new todolist is added', () => {
   const action = addTodolistAC("new todolist");

   const endState = tasksReducer(startState, action);


   const keys = Object.keys(endState);
   const newKey = keys.find(k => k !== "todolistId1" && k !== "todolistId2");
   if (!newKey) {
      throw Error("new key should be added");
   }

   expect(keys.length).toBe(3);
   expect(endState[newKey]).toEqual([]);
});

test('property with todolistId should be deleted', () => {
   const action = removeTodolistAC("todolistId2");

   const endState = tasksReducer(startState, action);


   const keys = Object.keys(endState);

   expect(keys.length).toBe(1);
   expect(endState["todolistId2"]).toBeUndefined();
});





