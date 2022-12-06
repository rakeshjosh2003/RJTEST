export const deleteUser = (id) => Promise.resolve()

export const getUsers = () =>
    Promise.resolve([
        {
            id: 'abcd',
            name: 'Alex',
            role: 'Admin',
        },
        {
            id: 'efgh',
            name: 'Erin',
            role: 'Developer',
        },
        {
            id: 'ijkh',
            name: 'Isaac',
            role: 'Developer',
        },
    ])

export const analytics = {
    log: (event) => Promise.resolve(),
}
