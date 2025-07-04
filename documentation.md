# Codebase Documentation

This document provides a detailed explanation of the codebase, covering the project structure, dependencies, and the roles of each file.

## Project Overview

This project is an Electron application with an Angular frontend. It provides a graphical user interface for managing Git repositories.

### Key Technologies

*   **Electron:** A framework for building desktop applications with web technologies.
*   **Angular:** A platform for building mobile and desktop web applications.
*   **simple-git:** A lightweight library for running Git commands in a Node.js application.
*   **Angular Material:** A UI component library for Angular applications.

## Architectural Diagram

```
+----------------------------------------------------------------------+
|                               Electron Main Process                  |
|                               (main.js)                              |
|----------------------------------------------------------------------|
| - Creates BrowserWindow                                              |
| - Loads Angular app (index.html)                                     |
| - Initializes IPC Handlers (ipc-handlers.js)                         |
| - Manages application lifecycle (ready, window-all-closed, activate) |
+---------------------------------^------------------------------------+
                                  |
                                  | IPC (Inter-Process Communication)
                                  |
+---------------------------------v------------------------------------+
|                               Electron Preload Script                |
|                               (preload.js)                           |
|----------------------------------------------------------------------|
| - Exposes `electronAPI` to the Renderer process via `contextBridge`  |
| - Provides a secure bridge between the Renderer and Main processes   |
+---------------------------------^------------------------------------+
                                  |
                                  | `window.electronAPI`
                                  |
+---------------------------------v------------------------------------+
|                               Electron Renderer Process (Angular App)|
|----------------------------------------------------------------------|
|                               +--------------------+
|                               | GitService         |
|                               +--------------------+
|                               | - Communicates with Main process via `electronAPI` |
|                               | - Manages application state with Angular Signals   |
|                               | - Provides mock data for browser testing           |
|                               +--------^-----------+
|                                        |
|               +------------------------+------------------------+
|               |                        |                        |
|               v                        v                        v
| +-----------------------+  +-------------------------+  +-----------------------+
| | ChangesBoardComponent |  | BranchManagementComponent |  | CommitHistoryComponent|
| +-----------------------+  +-------------------------+  +-----------------------+
| | - Displays staged/    |  | - Displays and manages  |  | - Displays commit     |
| |   unstaged changes    |  |   branches              |  |   history             |
| | - Handles staging/    |  | - Allows branch         |  |                       |
| |   unstaging (drag-drop)|  |   switching             |  |                       |
| | - Handles commits,    |  |                         |  |                       |
| |   pulls, and pushes   |  |                         |  |                       |
+----------------------------------------------------------------------+

```

## File-by-File Breakdown

### `my-electron-app/package.json`

This file defines the project's metadata, dependencies, and scripts.

*   **`dependencies`**:
    *   `@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/forms`, `@angular/platform-browser`, `@angular/router`: Core Angular libraries for building the application.
    *   `@angular/cdk`, `@angular/material`: Angular Material libraries for UI components.
    *   `rxjs`: A library for reactive programming.
    *   `simple-git`: Used in the Electron main process to interact with Git repositories.
    *   `tslib`: A runtime library for TypeScript that contains all of the TypeScript helper functions.
*   **`devDependencies`**:
    *   `@angular/build`, `@angular/cli`, `@angular/compiler-cli`: Angular CLI tools for building, serving, and testing the application.
    *   `@types/jasmine`: Type definitions for the Jasmine testing framework.
    *   `electron`: The Electron framework.
    *   `jasmine-core`, `karma`, `karma-chrome-launcher`, `karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`: Tools for testing the Angular application.
    *   `typescript`: The TypeScript compiler.
*   **`scripts`**:
    *   `ng`: Runs the Angular CLI.
    *   `start`: Builds the Angular application and then starts the Electron application.
    *   `build`: Builds the Angular application for production.
    *   `build:dev`: Builds the Angular application for development.
    *   `watch`: Builds the Angular application in watch mode.
    *   `test`: Runs the Angular application's tests.
    *   `run`: A convenience script that builds and starts the application.
    *   `electron`: Starts the Electron application in development mode.
    *   `electron:dev`: Builds the Angular application for development and then starts the Electron application.

### `my-electron-app/main.js`

This is the entry point for the Electron application. It creates a `BrowserWindow` and loads the Angular application into it.

*   **`createWindow()`**:
    *   Creates a new `BrowserWindow` with specified dimensions and web preferences.
    *   `nodeIntegration` is set to `false` and `contextIsolation` is set to `true` for security reasons. This prevents the renderer process from having direct access to Node.js APIs.
    *   `preload` is set to `preload.js`, which is a script that runs before the renderer process is loaded.
    *   Loads the `index.html` file from the `dist` directory, which is the output of the Angular build process.
    *   Opens the DevTools automatically in development mode.
    *   Calls `initializeGit(win)` to set up the IPC handlers for Git operations.
*   **App Events**:
    *   `'ready'`: Calls `createWindow()` when the application is ready.
    *   `'window-all-closed'`: Quits the application when all windows are closed (except on macOS).
    *   `'activate'`: Creates a new window when the application is activated and there are no existing windows.

### `my-electron-app/preload.js`

This script runs in a privileged environment before the renderer process is loaded. It exposes a limited set of Node.js APIs to the renderer process through the `contextBridge`.

*   **`contextBridge.exposeInMainWorld('electronAPI', ...)`**:
    *   Exposes a global `electronAPI` object to the `window` object in the renderer process.
    *   This object contains methods that invoke IPC handlers in the main process. This is a secure way to allow the renderer process to communicate with the main process without exposing the entire `ipcRenderer` object.

### `my-electron-app/ipc-handlers.js`

This file defines the IPC handlers for Git operations. These handlers are invoked by the renderer process through the `electronAPI` object exposed in `preload.js`.

*   **`initializeGit(win)`**:
    *   Sets up IPC handlers for various Git commands, such as `git-status`, `git-stage`, `git-unstage`, `git-commit`, etc.
    *   Uses the `simple-git` library to execute Git commands.
    *   The `win` object is passed to the `git-open-repo` handler to allow it to open a dialog box.

### `my-electron-app/angular.json`

This is the configuration file for the Angular CLI. It defines the project structure, build options, and other settings.

### `my-electron-app/tsconfig.json`

This is the main TypeScript configuration file for the project. It sets the compiler options for the TypeScript compiler.

### `my-electron-app/src/main.ts`

This is the entry point for the Angular application. It bootstraps the `AppComponent` and sets up the application configuration.

### `my-electron-app/src/index.html`

This is the main HTML file for the Angular application. It contains the `<app-root>` element, which is where the `AppComponent` is rendered.

### `my-electron-app/src/app/app.component.ts`

This is the root component of the Angular application. It serves as the main container for the other components.

*   **`imports`**: Imports the `ChangesBoardComponent`, `BranchManagementComponent`, and `CommitHistoryComponent`.
*   **`standalone: true`**: Indicates that this is a standalone component, which means it does not need to be declared in an `NgModule`.

### `my-electron-app/src/app/app.config.ts`

This file contains the application configuration for the Angular application.

*   **`provideZonelessChangeDetection()`**: Enables zoneless change detection, which can improve performance.

### `my-electron-app/src/app/git.service.ts`

This service provides an interface for interacting with the Git repository. It uses the `electronAPI` object to communicate with the Electron main process.

*   **`signals`**: Uses Angular signals to manage the state of the application. This includes the staged and unstaged changes, the repository path, the author, the branches, and the commit logs.
*   **`refresh()`**: Fetches the latest Git status, repository path, author, branches, and logs from the main process and updates the corresponding signals.
*   **Optimistic Updates**: The `stageFileOptimistic` and `unstageFileOptimistic` methods use an optimistic update strategy. They immediately update the UI with the expected changes and then revert the changes if the actual Git operation fails.
*   **Mock Data**: If the application is not running in an Electron environment, the service provides mock data for testing purposes.

### `my-electron-app/src/app/changes-board/changes-board.component.ts`

This component displays the staged and unstaged changes in the Git repository. It allows the user to stage and unstage files by dragging and dropping them between the two lists.

*   **Drag and Drop**: Uses the Angular CDK's drag and drop module to implement the drag and drop functionality.
*   **Commit**: Allows the user to enter a commit message and commit the staged changes.
*   **Pull/Push**: Allows the user to pull and push changes to and from a remote repository.

### `my-electron-app/src/app/branch-management/branch-management.component.ts`

This component displays the current branch and allows the user to switch between branches.

*   **`MatSelect`**: Uses the Angular Material `MatSelect` component to display the list of branches.

### `my-electron-app/src/app/commit-history/commit-history.component.ts`

This component displays the commit history of the repository.

*   **`MatTable`**: Uses the Angular Material `MatTable` component to display the commit logs in a tabular format.

## Conclusion

This codebase is a well-structured Electron application with a clear separation of concerns between the main process and the renderer process. The use of Angular signals and optimistic updates in the `GitService` provides a responsive and user-friendly experience. The application is also well-tested, with mock data provided for testing in a browser environment.