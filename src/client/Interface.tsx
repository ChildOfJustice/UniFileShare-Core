//TODO
export interface FetchParams {
    url: string

}

// example consuming code
// interface Todo {
//     userId: number;
//     id: number;
//     title: string;
//     completed: boolean;
// }
//
// const data = await makeFetch<Todo[]>(
//     "https://jsonplaceholder.typicode.com/todos"
// );
export async function makeFetch<T>(
    request: RequestInfo
): Promise<T> {
    const response = await fetch(request);
    const body = await response.json();
    return body;
}
class Interface {





    static makeFetch() {

    }

}

export default Interface;