import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    task: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket instances in actions
        ignoredActions: ['task/setSocket'],
        ignoredPaths: ['task.socket'],
      },
    }),
});

export default store;
