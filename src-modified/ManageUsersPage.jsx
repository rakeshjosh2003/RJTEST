import React, { useEffect, useState } from 'react'

import { analytics, deleteUser, getUsers } from '../index.js'
import './ManageUsersPage.css'

const onDeleteUser = async (id) => {
    await deleteUser(id)

    // Remove user from list
    document.getElementById(`user-${id}`)?.remove()
}

const UserNode = ({ id, name, role }) => (
    <div className="user" id={`user-${id}`}>
        <div>
            <span>{name}</span> - <span>{role}</span>
        </div>
        <div className="button" onClick={() => onDeleteUser(id)}>
            Delete user
        </div>
    </div>
)

const UserList = ({ users }) => {
    if (users.length === 0) {
        return null
    }

    return (
        <>
            <div role="heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                User List
            </div>
            {users.map(({ id, name, role }) => (
                <UserNode key={name} id={id} name={name} role={role} />
            ))}
        </>
    )
}

export const ManageUsersPage = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        analytics.log('Manage users page visited')
    })

    useEffect(() => {
        getUsers().then(setUsers)
    }, [])

    return <UserList users={users} />
}
