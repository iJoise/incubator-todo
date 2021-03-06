import {authAPI, ResultsCode} from "../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkType} from "./store";

const initialState: InitialStateType = {
   status: 'idle',
   error: null,
   initialized: false
}

const appSlice = createSlice({
   name: 'app',
   initialState: initialState,
   reducers: {
      setAppErrorAC: (state, action: PayloadAction<SetAppErrorPayloadType>) => {
         state.error = action.payload.error;
      },
      setAppStatusAC: (state, action: PayloadAction<SetAppStatusPayloadType>) => {
         state.status = action.payload.status;
      },
      setAppInitializedAC: (state, action: PayloadAction<SetAppInitPayloadType>) => {
         state.initialized = action.payload.value;
      }
   }
})

export const appReducer = appSlice.reducer;
export const {setAppStatusAC, setAppInitializedAC, setAppErrorAC} = appSlice.actions;
/**
 * Thunk Creator
 */
export const initializedAppTC = (): AppThunkType => async dispatch => {
   try {
      const res = await authAPI.me()
      dispatch(setAppInitializedAC({value: true}));
      if (res.data.resultCode === ResultsCode.OK) {
         dispatch(setIsLoggedInAC({value: true}))
      } else {
         handleServerAppError(res.data, dispatch)
      }
   } catch (err) {
      handleServerNetworkError(err, dispatch);
   }
}
/**
 * Types
 */
type SetAppErrorPayloadType = { error: string | null}
type SetAppStatusPayloadType = { status: RequestStatusType}
type SetAppInitPayloadType = {value: boolean};

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
   status: RequestStatusType
   error: string | null
   initialized: boolean
}
