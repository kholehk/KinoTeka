import {createBrowserHistory} from "history";

const appHistory = createBrowserHistory();

// export default history;
export function getHistory() {
    return appHistory;
}