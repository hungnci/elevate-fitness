/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createContext, useContext } from "react";
import { useLiveAPI } from "../hooks/use-live-api";

// Create a context to hold the Live API state
const LiveAPIContext = createContext(undefined);

/**
 * Provider component that wraps the application and makes the Live API state available to all child components.
 * It uses the useLiveAPI hook to initialize the API client.
 */
export const LiveAPIProvider = ({
  options,
  initialConfig,
  children,
}) => {
  const liveAPI = useLiveAPI(options, initialConfig);

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

/**
 * Custom hook to consume the Live API context.
 * Throws an error if used outside of a LiveAPIProvider.
 */
export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used wihin a LiveAPIProvider");
  }
  return context;
};
