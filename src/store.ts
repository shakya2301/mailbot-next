import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state type
interface InitialState {
  value: string[];
}

// Create the slice
const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    value: ["Hello"],
  } as InitialState,
  reducers: {
    addMsg: (state, action: PayloadAction<string>) => {
      state.value.push(action.payload);
    },
  },
});

// Export actions
export const { addMsg } = messagesSlice.actions;

// Configure the store
export const store = configureStore({
  reducer: {
    messages: messagesSlice.reducer, // Corrected reducer structure
  },
});

// Subscribe to store updates
store.subscribe(() => console.log(store.getState()));
